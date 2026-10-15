import { Prisma, Role } from '@prisma/client';
import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { paginationHelpers } from '../../utils/paginationHelpers';
import { createAuditLog } from '../../utils/auditLogger';
import { IPaginationOptions } from '../../interface/common';
import { IAuthUser, IUpdateMePayload, IUserFilters } from './user.interface';

const ALLOWED_SORT_FIELDS = ['createdAt', 'name', 'email'];

// role এর স্তর — বড় সংখ্যা মানে বেশি ক্ষমতা
const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MODERATOR: 2,
  MEMBER: 1,
};

const getLevel = (role: string): number => ROLE_LEVEL[role as Role] ?? 0;

// ইউজারের তথ্য দেখানোর সময় যা যা select হবে — password কখনো নেই
const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isBlocked: true,
  authProvider: true,
  createdAt: true,
  updatedAt: true,
  memberProfile: { select: { id: true, studentIdNo: true, membershipStatus: true } },
} satisfies Prisma.UserSelect;

// অন্য ইউজারের উপর কাজ করার নিয়ম:
// ১. নিজের উপর করা যাবে না
// ২. শুধু নিজের চেয়ে নিচের role এর ইউজারকে ম্যানেজ করা যাবে
const assertCanManage = (actor: IAuthUser, target: { id: string; role: Role }) => {
  if (actor.id === target.id) {
    throw new ApiError(400, 'You cannot perform this action on your own account');
  }

  if (getLevel(actor.role) <= getLevel(target.role)) {
    throw new ApiError(403, 'You can only manage users with a lower role than yours');
  }
};

const findActiveUserOrThrow = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

// ---------- নিজের অ্যাকাউন্ট দেখা ----------
const getMe = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

// ---------- নিজের অ্যাকাউন্ট আপডেট (email বদলানো যাবে না) ----------
const updateMe = async (userId: string, payload: IUpdateMePayload) => {
  await findActiveUserOrThrow(userId);

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.phone && { phone: payload.phone }),
    },
    select: userSelect,
  });
};

// ---------- সব ইউজার (Admin) — pagination + filter + search ----------
const getAllUsers = async (filters: IUserFilters, options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';

  const where: Prisma.UserWhereInput = { deletedAt: null };

  if (filters.role) {
    if (!Object.values(Role).includes(filters.role as Role)) {
      throw new ApiError(400, 'Invalid role filter');
    }
    where.role = filters.role as Role;
  }

  if (filters.isBlocked === 'true') where.isBlocked = true;
  if (filters.isBlocked === 'false') where.isBlocked = false;

  if (filters.searchTerm) {
    where.OR = [
      { name: { contains: filters.searchTerm, mode: 'insensitive' } },
      { email: { contains: filters.searchTerm, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ---------- একজন ইউজার (Admin) ----------
const getSingleUser = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

// ---------- Role পরিবর্তন (Admin) ----------
const changeUserRole = async (actor: IAuthUser, targetId: string, newRole: Role) => {
  const target = await findActiveUserOrThrow(targetId);

  assertCanManage(actor, target);

  // নতুন role ও নিজের role এর চেয়ে নিচের হতে হবে (Admin কাউকে Admin বানাতে পারবে না)
  if (getLevel(newRole) >= getLevel(actor.role)) {
    throw new ApiError(403, 'You can only assign roles lower than your own');
  }

  if (target.role === newRole) {
    throw new ApiError(400, `User already has the ${newRole} role`);
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: newRole },
    select: userSelect,
  });

  await createAuditLog(actor.id, 'USER_ROLE_CHANGED', 'User', targetId, `${target.role} -> ${newRole}`);

  return updated;
};

// ---------- Block / Unblock (Admin) ----------
const setBlockStatus = async (actor: IAuthUser, targetId: string, isBlocked: boolean) => {
  const target = await findActiveUserOrThrow(targetId);

  assertCanManage(actor, target);

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isBlocked },
    select: userSelect,
  });

  await createAuditLog(
    actor.id,
    isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    'User',
    targetId,
  );

  return updated;
};

// ---------- Soft delete (Admin) ----------
const softDeleteUser = async (actor: IAuthUser, targetId: string) => {
  const target = await findActiveUserOrThrow(targetId);

  assertCanManage(actor, target);

  await prisma.user.update({
    where: { id: targetId },
    data: { deletedAt: new Date(), isBlocked: true },
  });

  await createAuditLog(actor.id, 'USER_DELETED', 'User', targetId);
};

export const UserService = {
  getMe,
  updateMe,
  getAllUsers,
  getSingleUser,
  changeUserRole,
  setBlockStatus,
  softDeleteUser,
};