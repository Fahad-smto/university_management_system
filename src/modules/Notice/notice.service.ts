import { NoticeCategory, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { paginationHelpers } from '../../utils/paginationHelpers';
import { createAuditLog } from '../../utils/auditLogger';
import { IPaginationOptions } from '../../interface/common';
import {
  IAuthUser,
  ICreateNoticePayload,
  IUpdateNoticePayload,
  INoticeFilters,
} from './notice.interface';

const ALLOWED_SORT_FIELDS = ['publishedAt', 'createdAt', 'title', 'category'];

// যারা schedule করা (এখনো publish না হওয়া) নোটিশও দেখতে পারবে
const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];

const isStaff = (role?: string): boolean => !!role && STAFF_ROLES.includes(role);

// নোটিশ দেখানোর সময় যা যা select হবে
const noticeSelect = {
  id: true,
  title: true,
  content: true,
  category: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.NoticeSelect;

const parseDate = (value: string, fieldName: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
  return date;
};

const assertValidCategory = (category: string) => {
  if (!Object.values(NoticeCategory).includes(category as NoticeCategory)) {
    throw new ApiError(400, 'Invalid category');
  }
};

// সাধারণ ইউজার কখনো "এখনের পরের" তারিখের নোটিশ দেখবে না
const buildPublishedFilter = (
  filters: INoticeFilters,
  staff: boolean,
): Prisma.DateTimeFilter | undefined => {
  const now = new Date();
  const gte = filters.fromDate ? parseDate(filters.fromDate, 'fromDate') : undefined;
  let lte = filters.toDate ? parseDate(filters.toDate, 'toDate') : undefined;

  if (!staff && (!lte || lte > now)) {
    lte = now;
  }

  if (!gte && !lte) return undefined;

  return { ...(gte && { gte }), ...(lte && { lte }) };
};

// ---------- নোটিশ তৈরি (Moderator / Admin / Super Admin) ----------
const createNotice = async (actor: IAuthUser, payload: ICreateNoticePayload) => {
  if (payload.category) assertValidCategory(payload.category);

  // publishedAt না দিলে এখনই publish
  const publishedAt = payload.publishedAt
    ? parseDate(payload.publishedAt, 'publish date')
    : new Date();

  const notice = await prisma.notice.create({
    data: {
      createdById: actor.id,
      title: payload.title,
      content: payload.content,
      ...(payload.category && { category: payload.category as NoticeCategory }),
      publishedAt,
    },
    select: noticeSelect,
  });

  await createAuditLog(actor.id, 'NOTICE_CREATED', 'Notice', notice.id, notice.title);

  return notice;
};

// ---------- সব নোটিশ (pagination + filter + search) ----------
const getAllNotices = async (
  filters: INoticeFilters,
  options: IPaginationOptions,
  requesterRole?: string,
) => {
  const { page, limit, skip, sortOrder } = paginationHelpers.calculatePagination(options);

  // ডিফল্টভাবে সবচেয়ে নতুন প্রকাশিত নোটিশ আগে
  const safeSortBy =
    options.sortBy && ALLOWED_SORT_FIELDS.includes(options.sortBy) ? options.sortBy : 'publishedAt';

  const where: Prisma.NoticeWhereInput = { deletedAt: null };

  if (filters.category) {
    assertValidCategory(filters.category);
    where.category = filters.category as NoticeCategory;
  }

  const publishedFilter = buildPublishedFilter(filters, isStaff(requesterRole));
  if (publishedFilter) where.publishedAt = publishedFilter;

  // title বা content দিয়ে search
  if (filters.searchTerm) {
    where.OR = [
      { title: { contains: filters.searchTerm, mode: 'insensitive' } },
      { content: { contains: filters.searchTerm, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
      select: noticeSelect,
    }),
    prisma.notice.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ---------- একটা নোটিশ ----------
const getSingleNotice = async (id: string, requesterRole?: string) => {
  const notice = await prisma.notice.findFirst({
    where: {
      id,
      deletedAt: null,
      // সাধারণ ইউজার schedule করা নোটিশ দেখলে "পাওয়া যায়নি" ই পাবে
      ...(!isStaff(requesterRole) && { publishedAt: { lte: new Date() } }),
    },
    select: noticeSelect,
  });

  if (!notice) {
    throw new ApiError(404, 'Notice not found');
  }

  return notice;
};

// ---------- নোটিশ আপডেট ----------
const updateNotice = async (actor: IAuthUser, id: string, payload: IUpdateNoticePayload) => {
  const notice = await prisma.notice.findFirst({ where: { id, deletedAt: null } });

  if (!notice) {
    throw new ApiError(404, 'Notice not found');
  }

  if (payload.category) assertValidCategory(payload.category);

  // প্রকাশিত নোটিশের সময় বদলানো যাবে না, শুধু schedule করা নোটিশের বদলানো যাবে
  let publishedAt: Date | undefined;
  if (payload.publishedAt) {
    if (notice.publishedAt <= new Date()) {
      throw new ApiError(400, 'Cannot change the publish time of an already published notice');
    }
    publishedAt = parseDate(payload.publishedAt, 'publish date');
  }

  const updated = await prisma.notice.update({
    where: { id },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.content && { content: payload.content }),
      ...(payload.category && { category: payload.category as NoticeCategory }),
      ...(publishedAt && { publishedAt }),
    },
    select: noticeSelect,
  });

  await createAuditLog(actor.id, 'NOTICE_UPDATED', 'Notice', id);

  return updated;
};

// ---------- Soft delete ----------
const softDeleteNotice = async (actor: IAuthUser, id: string) => {
  const notice = await prisma.notice.findFirst({ where: { id, deletedAt: null } });

  if (!notice) {
    throw new ApiError(404, 'Notice not found');
  }

  await prisma.notice.update({ where: { id }, data: { deletedAt: new Date() } });

  await createAuditLog(actor.id, 'NOTICE_DELETED', 'Notice', id, notice.title);
};

export const NoticeService = {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNotice,
  softDeleteNotice,
};