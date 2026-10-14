import { EventStatus, Prisma, RegistrationStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { paginationHelpers } from '../../utils/paginationHelpers';
import { createAuditLog } from '../../utils/auditLogger';
import { IPaginationOptions } from '../../interface/common';
import {
  IAuthUser,
  ICreateEventPayload,
  IUpdateEventPayload,
  IEventFilters,
  IRegistrationFilters,
} from './event.interface';

// sort এ শুধু এই field গুলো চলবে
const ALLOWED_SORT_FIELDS = ['eventDate', 'fee', 'title'];

// Event status কোথা থেকে কোথায় যেতে পারবে
const ALLOWED_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  UPCOMING: ['ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// ইভেন্ট দেখানোর সময় যা যা select হবে (সব জায়গায় একই, তাই একবারই লেখা)
const eventSelect = {
  id: true,
  title: true,
  description: true,
  venue: true,
  eventDate: true,
  fee: true,
  capacity: true,
  status: true,
  createdAt: true,
  moderator: { select: { id: true, name: true } },
  // শুধু REGISTERED গুলো গোনা হবে (cancelled বাদ)
  _count: { select: { registrations: { where: { status: 'REGISTERED' as const } } } },
} as Prisma.EventSelect;

// _count সরিয়ে registeredCount আর seatsLeft যোগ করা
const formatEvent = <T extends { capacity?: number | null; _count: { registrations: number } }>(
  event: T,
) => {
  const { _count, ...rest } = event;
  const registeredCount = _count.registrations;

  return {
    ...rest,
    registeredCount,
    seatsLeft:
      event.capacity == null ? null : Math.max(event.capacity - registeredCount, 0),
  };
};

const parseDate = (value: string, fieldName: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
  return date;
};

// Admin/Super Admin সব ইভেন্ট ম্যানেজ করতে পারে।
// Moderator শুধু নিজের panel এর ইভেন্ট ম্যানেজ করতে পারবে।
const assertCanManageEvent = async (actor: IAuthUser, moderatorId: string) => {
  if (actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN') return;

  const isPanelMember = await prisma.moderatorMember.findFirst({
    where: { userId: actor.id, moderatorId, deletedAt: null },
  });

  if (!isPanelMember) {
    throw new ApiError(403, 'You are not a member of the moderator panel that owns this event');
  }
};

// ---------- ইভেন্ট তৈরি ----------
const createEvent = async (actor: IAuthUser, payload: ICreateEventPayload) => {
  // ১. panel সত্যিই আছে কিনা
  const panel = await prisma.moderator.findFirst({
    where: { id: payload.moderatorId, deletedAt: null },
  });

  if (!panel) {
    throw new ApiError(404, 'Moderator panel not found');
  }

  // ২. এই ব্যক্তি এই panel এর ইভেন্ট বানাতে পারে কিনা
  await assertCanManageEvent(actor, payload.moderatorId);

  // ৩. তারিখ ভবিষ্যতের হতে হবে
  const eventDate = parseDate(payload.eventDate, 'event date');

  if (eventDate <= new Date()) {
    throw new ApiError(400, 'Event date must be in the future');
  }

  const event = await prisma.event.create({
    data: {
      moderatorId: payload.moderatorId,
      title: payload.title,
      description: payload.description,
      venue: payload.venue,
      eventDate,
      fee: payload.fee ?? 0,
      capacity: payload.capacity,
    },
    select: eventSelect,
  });

  await createAuditLog(actor.id, 'EVENT_CREATED', 'Event', event.id, event.title);

  return formatEvent(event);
};

// ---------- সব ইভেন্ট (pagination + filter + search) ----------
const getAllEvents = async (filters: IEventFilters, options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'eventDate';

  const where: Prisma.EventWhereInput = { deletedAt: null };

  if (filters.status) {
    if (!Object.values(EventStatus).includes(filters.status as EventStatus)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    where.status = filters.status as EventStatus;
  }

  if (filters.moderatorId) where.moderatorId = filters.moderatorId;

  // তারিখের range filter
  if (filters.fromDate || filters.toDate) {
    where.eventDate = {
      ...(filters.fromDate && { gte: parseDate(filters.fromDate, 'fromDate') }),
      ...(filters.toDate && { lte: parseDate(filters.toDate, 'toDate') }),
    };
  }

  // title বা venue দিয়ে search
  if (filters.searchTerm) {
    where.OR = [
      { title: { contains: filters.searchTerm, mode: 'insensitive' } },
      { venue: { contains: filters.searchTerm, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
      select: eventSelect,
    }),
    prisma.event.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: events.map(formatEvent) };
};

// ---------- একটা ইভেন্ট ----------
const getSingleEvent = async (id: string) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
    select: eventSelect,
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  return formatEvent(event);
};

// ---------- ইভেন্ট আপডেট ----------
const updateEvent = async (actor: IAuthUser, id: string, payload: IUpdateEventPayload) => {
  const event = await prisma.event.findFirst({ where: { id, deletedAt: null } });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  await assertCanManageEvent(actor, event.moderatorId);

  if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
    throw new ApiError(400, `Cannot edit a ${event.status.toLowerCase()} event`);
  }

  // সিট কমাতে গেলে এখন যত জন registered আছে তার চেয়ে কম করা যাবে না
  if (payload.capacity !== undefined) {
    const registeredCount = await prisma.eventRegistration.count({
      where: { eventId: id, status: 'REGISTERED' },
    });

    if (payload.capacity < registeredCount) {
      throw new ApiError(400, `Capacity cannot be less than current registrations (${registeredCount})`);
    }
  }

  let eventDate: Date | undefined;
  if (payload.eventDate) {
    eventDate = parseDate(payload.eventDate, 'event date');
    if (eventDate <= new Date()) {
      throw new ApiError(400, 'Event date must be in the future');
    }
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.venue && { venue: payload.venue }),
      ...(eventDate && { eventDate }),
      ...(payload.fee !== undefined && { fee: payload.fee }),
      ...(payload.capacity !== undefined && { capacity: payload.capacity }),
    },
    select: eventSelect,
  });

  await createAuditLog(actor.id, 'EVENT_UPDATED', 'Event', id);

  return formatEvent(updated);
};

// ---------- ইভেন্টের status পরিবর্তন ----------
const updateEventStatus = async (actor: IAuthUser, id: string, newStatus: EventStatus) => {
  const event = await prisma.event.findFirst({ where: { id, deletedAt: null } });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  await assertCanManageEvent(actor, event.moderatorId);

  if (!ALLOWED_STATUS_TRANSITIONS[event.status].includes(newStatus)) {
    throw new ApiError(400, `Cannot change status from ${event.status} to ${newStatus}`);
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { status: newStatus },
    select: eventSelect,
  });

  await createAuditLog(actor.id, 'EVENT_STATUS_CHANGED', 'Event', id, `${event.status} -> ${newStatus}`);

  return formatEvent(updated);
};

// ---------- Soft delete ----------
const softDeleteEvent = async (actor: IAuthUser, id: string) => {
  const event = await prisma.event.findFirst({ where: { id, deletedAt: null } });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });

  await createAuditLog(actor.id, 'EVENT_DELETED', 'Event', id, event.title);
};

// ======================= Event Registration =======================

// ---------- ইভেন্টে registration (double-booking আটকানো transaction সহ) ----------
const registerForEvent = async (userId: string, eventId: string) => {
  return prisma.$transaction(async (tx) => {
    // এই ইভেন্টের row টা lock করে নেওয়া হচ্ছে।
    // একসাথে ১০ জন শেষ সিটের জন্য চাপ দিলে তারা লাইনে দাঁড়াবে, একজন একজন করে ঢুকবে,
    // তাই সিট লিমিটের বেশি registration কখনো হবে না।
    await tx.$queryRaw`SELECT id FROM events WHERE id = ${eventId} FOR UPDATE`;

    const event = await tx.event.findFirst({ where: { id: eventId, deletedAt: null } });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    if (event.status !== 'UPCOMING' || event.eventDate <= new Date()) {
      throw new ApiError(400, 'Registration is closed for this event');
    }

    // শুধু ACTIVE member রা registration করতে পারবে
    const profile = await tx.memberProfile.findFirst({
      where: { userId, deletedAt: null, membershipStatus: 'ACTIVE' },
    });

    if (!profile) {
      throw new ApiError(403, 'Only active members can register for events');
    }

    const existing = await tx.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existing && existing.status === 'REGISTERED') {
      throw new ApiError(400, 'You are already registered for this event');
    }

    // সিট লিমিট থাকলে ভরে গেছে কিনা
    const capacity = (event as typeof event & { capacity: number | null }).capacity;
    if (capacity !== null) {
      const registeredCount = await tx.eventRegistration.count({
        where: { eventId, status: 'REGISTERED' },
      });

      if (registeredCount >= capacity) {
        throw new ApiError(400, 'This event is full');
      }
    }

    const include = {
      event: { select: { id: true, title: true, venue: true, eventDate: true, fee: true } },
    };

    // আগে cancel করে থাকলে নতুন row না বানিয়ে পুরনোটাই আবার REGISTERED করা হচ্ছে
    if (existing) {
      return tx.eventRegistration.update({
        where: { id: existing.id },
        data: { status: 'REGISTERED', registeredAt: new Date() },
        include,
      });
    }

    return tx.eventRegistration.create({ data: { eventId, userId }, include });
  });
};

// ---------- নিজের registration cancel ----------
const cancelRegistration = async (userId: string, eventId: string) => {
  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
    include: { event: true },
  });

  if (!registration || registration.status !== 'REGISTERED') {
    throw new ApiError(404, 'Active registration not found');
  }

  if (registration.event.eventDate <= new Date()) {
    throw new ApiError(400, 'Cannot cancel after the event has started');
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: 'CANCELLED' },
  });
};

// ---------- একটা ইভেন্টের registration তালিকা (Moderator/Admin) ----------
const getRegistrations = async (
  actor: IAuthUser,
  eventId: string,
  filters: IRegistrationFilters,
  options: IPaginationOptions,
) => {
  const event = await prisma.event.findFirst({ where: { id: eventId, deletedAt: null } });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  await assertCanManageEvent(actor, event.moderatorId);

  const status = (filters.status || 'REGISTERED') as RegistrationStatus;

  if (!Object.values(RegistrationStatus).includes(status)) {
    throw new ApiError(400, 'Invalid status filter');
  }

  const { page, limit, skip, sortOrder } = paginationHelpers.calculatePagination(options);
  const where: Prisma.EventRegistrationWhereInput = { eventId, status };

  const [data, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      skip,
      take: limit,
      orderBy: { registeredAt: sortOrder },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            memberProfile: { select: { studentIdNo: true, session: true, class: true } },
          },
        },
      },
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ---------- আমি কোন কোন ইভেন্টে registered ----------
const getMyRegistrations = async (userId: string, options: IPaginationOptions) => {
  const { page, limit, skip, sortOrder } = paginationHelpers.calculatePagination(options);
  const where: Prisma.EventRegistrationWhereInput = { userId };

  const [data, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      skip,
      take: limit,
      orderBy: { registeredAt: sortOrder },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        event: {
          select: { id: true, title: true, venue: true, eventDate: true, fee: true, status: true },
        },
      },
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

export const EventService = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  updateEventStatus,
  softDeleteEvent,
  registerForEvent,
  cancelRegistration,
  getRegistrations,
  getMyRegistrations,
};