import { NoticeCategory, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { paginationHelpers } from '../../utils/paginationHelpers';
import { createAuditLog } from '../../utils/auditLogger';
import { emitToAll } from '../../socket';
import {
  IAuthUser,
  ICreateNoticePayload,
  IUpdateNoticePayload,
  INoticeFilters,
} from './notice.interface';

// sort এ শুধু এই field গুলো চলবে
const ALLOWED_SORT_FIELDS = ['publishedAt', 'createdAt', 'title'];

// notice দেখানোর সময় যা যা select হবে
const noticeSelect = {
  id: true,
  title: true,
  content: true,
  category: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  moderator: { select: { id: true, name: true } },
};

// Admin সব panel এর notice পারে, Moderator শুধু নিজের panel এর
const assertCanManageNotice = async (actor: IAuthUser, moderatorId: string) => {
  if (actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN') return;

  const isPanelMember = await prisma.moderatorMember.findFirst({
    where: { userId: actor.id, moderatorId, deletedAt: null },
  });

  if (!isPanelMember) {
    throw new ApiError(403, 'You are not a member of the moderator panel that owns this notice');
  }
};

// ---------- Notice তৈরি ----------
const createNotice = async (actor: IAuthUser, payload: ICreateNoticePayload) => {
  const panel = await prisma.moderator.findFirst({
    where: { id: payload.moderatorId, deletedAt: null },
  });

  if (!panel) {
    throw new ApiError(404, 'Moderator panel not found');
  }

  await assertCanManageNotice(actor, payload.moderatorId);

  const notice = await prisma.notice.create({
    data: {
      moderatorId: payload.moderatorId,
      title: payload.title,
      content: payload.content,
      category: payload.category ?? 'GENERAL',
    },
    select: noticeSelect,
  });

  await createAuditLog(actor.id, 'NOTICE_CREATED', 'Notice', notice.id, notice.title);

  // সবাইকে জানানো
  emitToAll('notice:new', notice);

  return notice;
};

// ---------- সব notice (pagination + filter + search) ----------
const getAllNotices = async (filters: INoticeFilters, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'publishedAt';

  const where: Prisma.NoticeWhereInput = { deletedAt: null };

  if (filters.category) {
    if (!Object.values(NoticeCategory).includes(filters.category as NoticeCategory)) {
      throw new ApiError(400, 'Invalid category filter');
    }
    where.category = filters.category as NoticeCategory;
  }

  if (filters.moderatorId) where.moderatorId = filters.moderatorId;

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

// ---------- একটা notice ----------
const getSingleNotice = async (id: string) => {
  const notice = await prisma.notice.findFirst({
    where: { id, deletedAt: null },
    select: noticeSelect,
  });

  if (!notice) {
    throw new ApiError(404, 'Notice not found');
  }

  return notice;
};

// ---------- Notice edit ----------
const updateNotice = async (actor: IAuthUser, id: string, payload: IUpdateNoticePayload) => {
  const notice = await prisma.notice.findFirst({ where: { id, deletedAt: null } });

  if (!notice) {
    throw new ApiError(404, 'Notice not found');
  }

  await assertCanManageNotice(actor, notice.moderatorId);

  const updated = await prisma.notice.update({
    where: { id },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.content && { content: payload.content }),
      ...(payload.category && { category: payload.category }),
    },
    select: noticeSelect,
  });

  await createAuditLog(actor.id, 'NOTICE_UPDATED', 'Notice', id, updated.title);

  emitToAll('notice:updated', updated);

  return updated;
};

// ---------- Soft delete ----------
const softDeleteNotice = async (actor: IAuthUser, id: string) => {
  const notice = await prisma.notice.findFirst({ where: { id, deletedAt: null } });

  if (!notice) {
    throw new ApiError(404, 'Notice not found');
  }

  await assertCanManageNotice(actor, notice.moderatorId);

  await prisma.notice.update({ where: { id }, data: { deletedAt: new Date() } });

  await createAuditLog(actor.id, 'NOTICE_DELETED', 'Notice', id, notice.title);

  emitToAll('notice:deleted', { id });
};

export const NoticeService = {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNotice,
  softDeleteNotice,
};