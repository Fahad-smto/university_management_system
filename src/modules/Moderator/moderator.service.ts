import { ModeratorStatus, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { paginationHelpers } from '../../utils/paginationHelpers';
import { createAuditLog } from '../../utils/auditLogger';
import { canSeeContact } from '../../utils/contactAccess';
import { IPaginationOptions } from '../../interface/common';
import {
  IAuthUser,
  ICreateModeratorPayload,
  IUpdateModeratorPayload,
  IModeratorFilters,
  IAddMemberPayload,
  IUpdateMemberPayload,
} from './moderator.interface';

const ALLOWED_SORT_FIELDS = ['name', 'tenureStart', 'createdAt'];

// panel দেখানোর সময় যা যা select হবে
const panelSelect = {
  id: true,
  name: true,
  type: true,
  tenureStart: true,
  tenureEnd: true,
  status: true,
  createdAt: true,
  _count: { select: { members: { where: { deletedAt: null } } } },
} satisfies Prisma.ModeratorSelect;

// _count সরিয়ে memberCount বসানো
const formatPanel = <T extends { _count: { members: number } }>(panel: T) => {
  const { _count, ...rest } = panel;
  return { ...rest, memberCount: _count.members };
};

const parseDate = (value: string, fieldName: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
  return date;
};

const findPanelOrThrow = async (id: string) => {
  const panel = await prisma.moderator.findFirst({ where: { id, deletedAt: null } });

  if (!panel) {
    throw new ApiError(404, 'Moderator panel not found');
  }

  return panel;
};

// ---------- Panel তৈরি ----------
const createModerator = async (actor: IAuthUser, payload: ICreateModeratorPayload) => {
  const tenureStart = parseDate(payload.tenureStart, 'tenure start');
  const tenureEnd = payload.tenureEnd ? parseDate(payload.tenureEnd, 'tenure end') : undefined;

  if (tenureEnd && tenureEnd <= tenureStart) {
    throw new ApiError(400, 'Tenure end must be after tenure start');
  }

  const panel = await prisma.moderator.create({
    data: { name: payload.name, type: payload.type, tenureStart, tenureEnd },
    select: panelSelect,
  });

  await createAuditLog(actor.id, 'MODERATOR_PANEL_CREATED', 'Moderator', panel.id, panel.name);

  return formatPanel(panel);
};

// ---------- সব panel (public) — pagination + filter + search ----------
const getAllModerators = async (filters: IModeratorFilters, options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'tenureStart';

  const where: Prisma.ModeratorWhereInput = { deletedAt: null };

  if (filters.status) {
    if (!Object.values(ModeratorStatus).includes(filters.status as ModeratorStatus)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    where.status = filters.status as ModeratorStatus;
  }

  if (filters.type) {
    where.type = { equals: filters.type, mode: 'insensitive' };
  }

  if (filters.searchTerm) {
    where.name = { contains: filters.searchTerm, mode: 'insensitive' };
  }

  const [panels, total] = await Promise.all([
    prisma.moderator.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
      select: panelSelect,
    }),
    prisma.moderator.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: panels.map(formatPanel) };
};

// ---------- একটা panel + তার সদস্যরা (public, phone শুধু privileged role এ) ----------
const getSingleModerator = async (id: string, requesterRole?: string) => {
  const withContact = canSeeContact(requesterRole);

  const panel = await prisma.moderator.findFirst({
    where: { id, deletedAt: null },
    select: {
      ...panelSelect,
      members: {
        where: { deletedAt: null },
        orderBy: { joinedAt: 'asc' },
        select: {
          id: true,
          position: true,
          joinedAt: true,
          user: { select: { id: true, name: true, ...(withContact && { phone: true }) } },
        },
      },
    },
  });

  if (!panel) {
    throw new ApiError(404, 'Moderator panel not found');
  }

  return formatPanel(panel);
};

// ---------- Panel আপডেট ----------
const updateModerator = async (actor: IAuthUser, id: string, payload: IUpdateModeratorPayload) => {
  const panel = await findPanelOrThrow(id);

  // নতুন তারিখ না দিলে আগেরটাই ধরা হবে, তারপর দুটো মিলিয়ে চেক
  const tenureStart = payload.tenureStart
    ? parseDate(payload.tenureStart, 'tenure start')
    : panel.tenureStart;
  const tenureEnd = payload.tenureEnd ? parseDate(payload.tenureEnd, 'tenure end') : panel.tenureEnd;

  if (tenureEnd && tenureEnd <= tenureStart) {
    throw new ApiError(400, 'Tenure end must be after tenure start');
  }

  const updated = await prisma.moderator.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.type && { type: payload.type }),
      tenureStart,
      tenureEnd,
    },
    select: panelSelect,
  });

  await createAuditLog(actor.id, 'MODERATOR_PANEL_UPDATED', 'Moderator', id);

  return formatPanel(updated);
};

// ---------- Panel এর status (ACTIVE / INACTIVE) ----------
const updateModeratorStatus = async (actor: IAuthUser, id: string, status: ModeratorStatus) => {
  const panel = await findPanelOrThrow(id);

  if (panel.status === status) {
    throw new ApiError(400, `Panel is already ${status}`);
  }

  const updated = await prisma.moderator.update({
    where: { id },
    data: { status },
    select: panelSelect,
  });

  await createAuditLog(actor.id, 'MODERATOR_PANEL_STATUS_CHANGED', 'Moderator', id, `${panel.status} -> ${status}`);

  return formatPanel(updated);
};

// ---------- Panel soft delete ----------
const softDeleteModerator = async (actor: IAuthUser, id: string) => {
  const panel = await findPanelOrThrow(id);

  await prisma.moderator.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'INACTIVE' },
  });

  await createAuditLog(actor.id, 'MODERATOR_PANEL_DELETED', 'Moderator', id, panel.name);
};

// ======================= Panel এর সদস্য =======================

const memberSelect = {
  id: true,
  position: true,
  joinedAt: true,
  moderatorId: true,
  user: { select: { id: true, name: true, role: true } },
} satisfies Prisma.ModeratorMemberSelect;

// ---------- সদস্য যোগ (সাথে role sync) ----------
const addMember = async (actor: IAuthUser, moderatorId: string, payload: IAddMemberPayload) => {
  await findPanelOrThrow(moderatorId);

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null },
    select: { id: true, role: true, isBlocked: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isBlocked) {
    throw new ApiError(400, 'Cannot add a blocked user to a panel');
  }

  // একই ব্যক্তি একই panel এ দুইবার থাকতে পারবে না
  const alreadyMember = await prisma.moderatorMember.findFirst({
    where: { moderatorId, userId: payload.userId, deletedAt: null },
  });

  if (alreadyMember) {
    throw new ApiError(400, 'This user is already a member of this panel');
  }

  // একই পদে একজনই থাকবে (case না মিলিয়ে চেক)
  const positionTaken = await prisma.moderatorMember.findFirst({
    where: { moderatorId, position: { equals: payload.position, mode: 'insensitive' } },
  });

  if (positionTaken) {
    throw new ApiError(400, `The position "${payload.position}" is already taken in this panel`);
  }

  // সদস্য যোগ আর role বদল একসাথে — একটা fail করলে অন্যটাও হবে না
  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.moderatorMember.create({
      data: { moderatorId, userId: payload.userId, position: payload.position },
      select: memberSelect,
    });

    // সাধারণ MEMBER হলে MODERATOR role দেওয়া হচ্ছে (Admin দের role ছোঁয়া হয় না)
    if (user.role === 'MEMBER') {
      await tx.user.update({ where: { id: payload.userId }, data: { role: 'MODERATOR' } });
    }

    return created;
  });

  await createAuditLog(
    actor.id,
    'MODERATOR_MEMBER_ADDED',
    'ModeratorMember',
    member.id,
    `${member.user.name} as ${payload.position}`,
  );

  return member;
};

// ---------- সদস্যের পদ বদল ----------
const updateMember = async (actor: IAuthUser, memberId: string, payload: IUpdateMemberPayload) => {
  const member = await prisma.moderatorMember.findFirst({ where: { id: memberId, deletedAt: null } });

  if (!member) {
    throw new ApiError(404, 'Panel member not found');
  }

  const positionTaken = await prisma.moderatorMember.findFirst({
    where: {
      moderatorId: member.moderatorId,
      position: { equals: payload.position, mode: 'insensitive' },
      NOT: { id: memberId },
    },
  });

  if (positionTaken) {
    throw new ApiError(400, `The position "${payload.position}" is already taken in this panel`);
  }

  const updated = await prisma.moderatorMember.update({
    where: { id: memberId },
    data: { position: payload.position },
    select: memberSelect,
  });

  await createAuditLog(
    actor.id,
    'MODERATOR_MEMBER_POSITION_CHANGED',
    'ModeratorMember',
    memberId,
    `${member.position} -> ${payload.position}`,
  );

  return updated;
};

// ---------- সদস্য সরানো (সাথে role sync) ----------
// এখানে row টা সত্যিই মুছে ফেলা হচ্ছে (soft delete না), কারণ (panel + position) এ unique constraint আছে,
// soft delete করলে সেই পদে আর কাউকে বসানো যেত না। কে কখন সরলো তার ইতিহাস audit log এ থাকছে।
const removeMember = async (actor: IAuthUser, memberId: string) => {
  const member = await prisma.moderatorMember.findFirst({
    where: { id: memberId, deletedAt: null },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  if (!member) {
    throw new ApiError(404, 'Panel member not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.moderatorMember.delete({ where: { id: memberId } });

    // অন্য কোনো panel এ না থাকলে MODERATOR role থেকে আবার MEMBER করা হচ্ছে
    const otherPanels = await tx.moderatorMember.count({
      where: { userId: member.userId, deletedAt: null },
    });

    if (otherPanels === 0 && member.user.role === 'MODERATOR') {
      await tx.user.update({ where: { id: member.userId }, data: { role: 'MEMBER' } });
    }
  });

  await createAuditLog(
    actor.id,
    'MODERATOR_MEMBER_REMOVED',
    'ModeratorMember',
    memberId,
    `${member.user.name} (${member.position})`,
  );
};

export const ModeratorService = {
  createModerator,
  getAllModerators,
  getSingleModerator,
  updateModerator,
  updateModeratorStatus,
  softDeleteModerator,
  addMember,
  updateMember,
  removeMember,
};