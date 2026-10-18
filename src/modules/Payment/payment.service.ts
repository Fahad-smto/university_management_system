import { DueStatus, PaymentStatus, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { paginationHelpers } from '../../utils/paginationHelpers';
import { createAuditLog } from '../../utils/auditLogger';
import { createBkashPayment, executeBkashPayment, queryBkashPayment } from '../../utils/bkash';
import { IPaginationOptions } from '../../interface/common';
import { IAuthUser, IGenerateDuesPayload, IDueFilters, IPaymentFilters } from './payment.interface';

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN'];

// ---------- ছোট সাহায্যকারী ----------

const toInt = (value: string, name: string): number => {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new ApiError(400, `Invalid ${name}`);
  }
  return number;
};

const dueSelect = {
  id: true,
  month: true,
  year: true,
  amount: true,
  status: true,
  dueDate: true,
} satisfies Prisma.MonthlyDueSelect;

const paymentSelect = {
  id: true,
  amount: true,
  purpose: true,
  status: true,
  transactionId: true, // bKash এর trxID, সফল হলে বসে
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true } },
  due: { select: { id: true, month: true, year: true } },
} satisfies Prisma.PaymentSelect;

// মেয়াদ পার হওয়া UNPAID due গুলোকে OVERDUE করে দেওয়া।
// আলাদা cron job লাগে না, তালিকা দেখানোর আগেই এটা চলে।
const markOverdueDues = async () => {
  await prisma.monthlyDue.updateMany({
    where: { status: 'UNPAID', deletedAt: null, dueDate: { lt: new Date() } },
    data: { status: 'OVERDUE' },
  });
};

const buildDueWhere = (
  filters: IDueFilters,
  base: Prisma.MonthlyDueWhereInput = {},
): Prisma.MonthlyDueWhereInput => {
  const where: Prisma.MonthlyDueWhereInput = { ...base, deletedAt: null };

  if (filters.status) {
    if (!Object.values(DueStatus).includes(filters.status as DueStatus)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    where.status = filters.status as DueStatus;
  }

  if (filters.month) where.month = toInt(filters.month, 'month');
  if (filters.year) where.year = toInt(filters.year, 'year');

  return where;
};

const getPaymentView = async (id: string) => {
  return prisma.payment.findUnique({ where: { id }, select: paymentSelect });
};

// ======================= মাসিক Due =======================

// ---------- সব ACTIVE সদস্যের জন্য due তৈরি (Admin) ----------
const generateMonthlyDues = async (actor: IAuthUser, payload: IGenerateDuesPayload) => {
  const members = await prisma.memberProfile.findMany({
    where: { membershipStatus: 'ACTIVE', deletedAt: null },
    select: { id: true },
  });

  if (members.length === 0) {
    throw new ApiError(400, 'There are no active members to create dues for');
  }

  // মাসের শেষ দিন (month এ 1 থেকে 12, তাই "পরের মাসের 0 তারিখ" = এই মাসের শেষ দিন)
  const dueDate = new Date(payload.year, payload.month, 0, 23, 59, 59);

  // skipDuplicates: কোনো সদস্যের ওই মাসের due আগে থেকে থাকলে সেটা বাদ যাবে।
  // তাই একই মাসের জন্য দ্বিতীয়বার চালালেও ডুপ্লিকেট হয় না
  const result = await prisma.monthlyDue.createMany({
    data: members.map((member) => ({
      memberId: member.id,
      month: payload.month,
      year: payload.year,
      amount: payload.amount,
      dueDate,
    })),
    skipDuplicates: true,
  });

  await createAuditLog(
    actor.id,
    'MONTHLY_DUES_GENERATED',
    'MonthlyDue',
    `${payload.year}-${payload.month}`,
    `created ${result.count}, amount ${payload.amount}`,
  );

  return {
    month: payload.month,
    year: payload.year,
    amount: payload.amount,
    created: result.count,
    alreadyExisted: members.length - result.count,
  };
};

// ---------- সব due (Moderator / Admin) ----------
const getAllDues = async (filters: IDueFilters, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  await markOverdueDues();
  const where = buildDueWhere(filters);

  const [data, total] = await Promise.all([
    prisma.monthlyDue.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: {
        ...dueSelect,
        member: {
          select: { id: true, studentIdNo: true, user: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.monthlyDue.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ---------- নিজের due ----------
const getMyDues = async (userId: string, filters: IDueFilters, options: IPaginationOptions) => {
  const profile = await prisma.memberProfile.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true },
  });

  if (!profile) {
    throw new ApiError(404, 'Member profile not found. Please create one first');
  }

  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  await markOverdueDues();
  const where = buildDueWhere(filters, { memberId: profile.id });

  const [data, total] = await Promise.all([
    prisma.monthlyDue.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: dueSelect,
    }),
    prisma.monthlyDue.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ======================= bKash পেমেন্ট =======================

type IPaymentRow = {
  id: string;
  userId: string;
  dueId: string | null;
  bkashPaymentId: string | null;
};

// পেমেন্ট সফল হলে: Payment = SUCCESS আর Due = PAID, দুটো একসাথে (transaction)।
// updateMany এ "status = PENDING" শর্ত থাকায় একই পেমেন্ট দুইবার প্রক্রিয়া হতে পারে না,
// দুটো রিকোয়েস্ট একসাথে এলেও শুধু একটাই জিতবে
const markPaymentSuccess = async (payment: IPaymentRow, trxId: string) => {
  const claimed = await prisma.$transaction(async (tx) => {
    const result = await tx.payment.updateMany({
      where: { id: payment.id, status: 'PENDING' },
      data: { status: 'SUCCESS', transactionId: trxId },
    });

    if (result.count === 0) return false;

    if (payment.dueId) {
      await tx.monthlyDue.update({ where: { id: payment.dueId }, data: { status: 'PAID' } });
    }

    return true;
  });

  if (claimed) {
    await createAuditLog(payment.userId, 'PAYMENT_SUCCESS', 'Payment', payment.id, `bKash trxID ${trxId}`);
  }
};

// PENDING পেমেন্ট বন্ধ করা (ব্যর্থ বা বাতিল)
const closePayment = async (paymentId: string, status: 'FAILED' | 'CANCELLED') => {
  await prisma.payment.updateMany({
    where: { id: paymentId, status: 'PENDING' },
    data: { status },
  });
};

// bKash কে execute বলে ফলাফল দেখা
const completePayment = async (payment: IPaymentRow) => {
  if (!payment.bkashPaymentId) {
    throw new ApiError(400, 'This payment was not started with bKash');
  }

  const result = await executeBkashPayment(payment.bkashPaymentId);

  const isPaid =
    result.statusCode === '0000' && result.transactionStatus === 'Completed' && result.trxID;

  if (isPaid) {
    await markPaymentSuccess(payment, result.trxID);
  } else {
    console.error('bKash execute failed:', result);
    await closePayment(payment.id, 'FAILED');
  }
};

// ---------- পেমেন্ট শুরু ----------
const initiatePayment = async (userId: string, dueId: string) => {
  const due = await prisma.monthlyDue.findFirst({
    where: { id: dueId, deletedAt: null },
    include: { member: { select: { userId: true } } },
  });

  if (!due) {
    throw new ApiError(404, 'Due not found');
  }

  // শুধু নিজের due এর পেমেন্ট করা যাবে
  if (due.member.userId !== userId) {
    throw new ApiError(403, 'This due does not belong to you');
  }

  if (due.status === 'PAID') {
    throw new ApiError(400, 'This due is already paid');
  }

  // আগের অসমাপ্ত চেষ্টাগুলো বাতিল, নতুন চেষ্টাটাই এখন একমাত্র সক্রিয়।
  // পুরনো bKash পেজে কেউ টাকা দিতে চাইলেও callback এ আমরা সেটা execute করব না
  await prisma.payment.updateMany({
    where: { dueId, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  });

  // টাকার অঙ্ক ডাটাবেসের due থেকে আসছে, ক্লায়েন্ট থেকে না
  const payment = await prisma.payment.create({
    data: { userId, dueId: due.id, amount: due.amount, purpose: 'MEMBERSHIP_DUE' },
  });

  // bKash এ পেমেন্ট তৈরি, ব্যর্থ হলে আমাদের Payment ও FAILED করে দেওয়া হয়
  const bkash = await createBkashPayment({
    amount: Number(due.amount).toFixed(2),
    invoiceNumber: payment.id,
    payerReference: userId,
  }).catch(async (error) => {
    await closePayment(payment.id, 'FAILED');
    throw error;
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { bkashPaymentId: bkash.paymentID },
  });

  return {
    paymentId: payment.id,
    amount: payment.amount,
    bkashPaymentId: bkash.paymentID,
    bkashURL: bkash.bkashURL, // এই লিংক ব্রাউজারে খুলে পেমেন্ট করতে হবে
  };
};

// ---------- bKash callback (ব্যবহারকারী পেমেন্টের পর এখানে ফেরত আসে) ----------
const handleBkashCallback = async (bkashPaymentId?: string, status?: string) => {
  if (!bkashPaymentId || !status) {
    throw new ApiError(400, 'Invalid callback request');
  }

  const payment = await prisma.payment.findUnique({ where: { bkashPaymentId } });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  // শুধু PENDING হলেই কিছু করা হয়। পেজ রিফ্রেশ বা দুইবার callback এলে আগের ফলাফলটাই দেখাবে
  if (payment.status === 'PENDING') {
    if (status === 'success') {
      await completePayment(payment); // এখানেই bKash এ যাচাই হয়
    } else if (status === 'cancel') {
      await closePayment(payment.id, 'CANCELLED');
    } else {
      await closePayment(payment.id, 'FAILED');
    }
  }

  return getPaymentView(payment.id);
};

// নিজের পেমেন্ট বা Admin, নাহলে 403
const findPaymentForUser = async (actor: IAuthUser, paymentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (!STAFF_ROLES.includes(actor.role) && payment.userId !== actor.id) {
    throw new ApiError(403, 'You cannot access this payment');
  }

  return payment;
};

// ---------- আটকে থাকা PENDING পেমেন্ট bKash এ মিলিয়ে দেখা ----------
// ব্যবহারকারী টাকা দিয়ে ব্রাউজার বন্ধ করে ফেললে callback আসে না, তখন এটা কাজে লাগে
const verifyPayment = async (actor: IAuthUser, paymentId: string) => {
  const payment = await findPaymentForUser(actor, paymentId);

  if (payment.status === 'PENDING' && payment.bkashPaymentId) {
    const result = await queryBkashPayment(payment.bkashPaymentId);

    if (result.transactionStatus === 'Completed' && result.trxID) {
      await markPaymentSuccess(payment, result.trxID);
    } else if (result.transactionStatus === 'Authorized') {
      // ব্যবহারকারী পেমেন্ট নিশ্চিত করেছে কিন্তু আমরা execute করিনি
      await completePayment(payment);
    }
  }

  return getPaymentView(paymentId);
};

// ======================= পেমেন্ট ইতিহাস =======================

const buildPaymentWhere = (
  filters: IPaymentFilters,
  base: Prisma.PaymentWhereInput = {},
): Prisma.PaymentWhereInput => {
  const where: Prisma.PaymentWhereInput = { ...base };

  if (filters.status) {
    if (!Object.values(PaymentStatus).includes(filters.status as PaymentStatus)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    where.status = filters.status as PaymentStatus;
  }

  return where;
};

// ---------- নিজের পেমেন্ট ইতিহাস ----------
const getMyPayments = async (userId: string, filters: IPaymentFilters, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const where = buildPaymentWhere(filters, { userId });

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: paymentSelect,
    }),
    prisma.payment.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ---------- সব পেমেন্ট (Admin) ----------
const getAllPayments = async (filters: IPaymentFilters, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const where = buildPaymentWhere(filters, filters.userId ? { userId: filters.userId } : {});

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: paymentSelect,
    }),
    prisma.payment.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ---------- একটা পেমেন্ট ----------
const getSinglePayment = async (actor: IAuthUser, paymentId: string) => {
  await findPaymentForUser(actor, paymentId);
  return getPaymentView(paymentId);
};

export const PaymentService = {
  generateMonthlyDues,
  getAllDues,
  getMyDues,
  initiatePayment,
  handleBkashCallback,
  verifyPayment,
  getMyPayments,
  getAllPayments,
  getSinglePayment,
};