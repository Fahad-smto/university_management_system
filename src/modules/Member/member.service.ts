import { MembershipStatus, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { paginationHelpers } from '../../utils/paginationHelpers';
import { createAuditLog } from '../../utils/auditLogger';
import { IPaginationOptions } from '../../interface/common';
import {
  ICreateMemberProfilePayload,
  IUpdateMemberProfilePayload,
  IMemberFilters,
} from './member.interface';

// যারা phone (contact number) দেখতে পারবে
const PRIVILEGED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];

const canSeeContact = (role?: string): boolean => {
  return !!role && PRIVILEGED_ROLES.includes(role);
};

// sort এ শুধু এই field গুলো অনুমোদিত (যেকোনো field দিলে Prisma error দিত)
const ALLOWED_SORT_FIELDS = ['joinedAt', 'createdAt', 'session', 'class'];

// status পরিবর্তনের নিয়ম — কোন status থেকে কোনটায় যাওয়া যাবে
const ALLOWED_TRANSITIONS: Record<MembershipStatus, MembershipStatus[]> = {
  PENDING: ['ACTIVE', 'INACTIVE'],
  ACTIVE: ['INACTIVE', 'EXPIRED'],
  INACTIVE: ['ACTIVE'],
  EXPIRED: ['ACTIVE'],
};

// ---------- নিজের Member Profile তৈরি (registration, কোনো payment নেই) ----------
const createMyProfile = async (userId: string, payload: ICreateMemberProfilePayload) => {
  // ১. এই ইউজারের আগে থেকেই profile আছে কিনা
  const existingProfile = await prisma.memberProfile.findUnique({ where: { userId } });

  if (existingProfile) {
    throw new ApiError(400, 'You already have a member profile');
  }

  // ২. এই student ID আগে কেউ ব্যবহার করেছে কিনা
  const duplicateStudentId = await prisma.memberProfile.findUnique({
    where: { studentIdNo: payload.studentIdNo },
  });

  if (duplicateStudentId) {
    throw new ApiError(400, 'This student ID is already registered');
  }

  // ৩. section দিলে সেটা সত্যিই আছে কিনা
  if (payload.sectionId) {
    const section = await prisma.section.findFirst({
      where: { id: payload.sectionId, deletedAt: null },
    });

    if (!section) {
      throw new ApiError(404, 'Section not found');
    }
  }

  // ৪. profile তৈরি — status ডিফল্টভাবে PENDING, moderator অ্যাপ্রুভ করলে ACTIVE হবে
  return prisma.memberProfile.create({
    data: {
      userId,
      studentIdNo: payload.studentIdNo,
      session: payload.session,
      class: payload.class,
      sectionId: payload.sectionId,
    },
    include: { section: { select: { id: true, name: true } } },
  });
};

// ---------- নিজের Profile দেখা ----------
const getMyProfile = async (userId: string) => {
  const profile = await prisma.memberProfile.findFirst({
    where: { userId, deletedAt: null },
    include: {
      section: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!profile) {
    throw new ApiError(404, 'Member profile not found. Please create one first');
  }

  return profile;
};

// ---------- নিজের Profile আপডেট ----------
const updateMyProfile = async (userId: string, payload: IUpdateMemberProfilePayload) => {
  const profile = await prisma.memberProfile.findFirst({
    where: { userId, deletedAt: null },
  });

  if (!profile) {
    throw new ApiError(404, 'Member profile not found');
  }

  // profile আর user — দুটো টেবিলই একসাথে আপডেট হচ্ছে (nested update, একই transaction এ)
  return prisma.memberProfile.update({
    where: { id: profile.id },
    data: {
      ...(payload.session && { session: payload.session }),
      ...(payload.class && { class: payload.class }),
      user: {
        update: {
          ...(payload.name && { name: payload.name }),
          ...(payload.phone && { phone: payload.phone }),
        },
      },
    },
    include: {
      section: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
};

// ---------- Public Directory (pagination + filter + search) ----------
const getPublicMembers = async (
  filters: IMemberFilters,
  options: IPaginationOptions,
  requesterRole?: string,
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'joinedAt';

  // শুধু ACTIVE এবং মুছে না ফেলা member গুলো public এ দেখাবে
  const where: Prisma.MemberProfileWhereInput = {
    deletedAt: null,
    membershipStatus: 'ACTIVE',
    user: { deletedAt: null, isBlocked: false },
  };

  if (filters.sectionId) where.sectionId = filters.sectionId;
  if (filters.session) where.session = filters.session;
  if (filters.class) where.class = filters.class;

  // নাম বা student ID দিয়ে search
  if (filters.searchTerm) {
    where.OR = [
      { studentIdNo: { contains: filters.searchTerm, mode: 'insensitive' } },
      { user: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
    ];
  }

  // phone শুধু privileged role দের জন্য select এ যোগ হবে — বাকিদের কাছে field টাই যাবে না
  const withContact = canSeeContact(requesterRole);

  const [data, total] = await Promise.all([
    prisma.memberProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
      select: {
        id: true,
        studentIdNo: true,
        session: true,
        class: true,
        joinedAt: true,
        section: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, ...(withContact && { phone: true }) } },
      },
    }),
    prisma.memberProfile.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

// ---------- একজন member এর Public তথ্য ----------
const getPublicMemberById = async (id: string, requesterRole?: string) => {
  const withContact = canSeeContact(requesterRole);

  const member = await prisma.memberProfile.findFirst({
    where: { id, deletedAt: null, membershipStatus: 'ACTIVE' },
    select: {
      id: true,
      studentIdNo: true,
      session: true,
      class: true,
      joinedAt: true,
      section: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, ...(withContact && { phone: true }) } },
    },
  });

  if (!member) {
    throw new ApiError(404, 'Member not found');
  }

  return member;
};

// ---------- Membership Status পরিবর্তন (Moderator/Admin) ----------
const updateMembershipStatus = async (
  memberId: string,
  newStatus: MembershipStatus,
  actorId: string,
) => {
  const member = await prisma.memberProfile.findFirst({
    where: { id: memberId, deletedAt: null },
  });

  if (!member) {
    throw new ApiError(404, 'Member not found');
  }

  // বৈধ transition কিনা চেক (যেমন PENDING থেকে সরাসরি EXPIRED হওয়া যাবে না)
  if (!ALLOWED_TRANSITIONS[member.membershipStatus].includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot change status from ${member.membershipStatus} to ${newStatus}`,
    );
  }

  const updated = await prisma.memberProfile.update({
    where: { id: memberId },
    data: { membershipStatus: newStatus },
  });

  // কে কোন status বদলালো তার রেকর্ড
  await createAuditLog(
    actorId,
    'MEMBER_STATUS_CHANGED',
    'MemberProfile',
    memberId,
    `${member.membershipStatus} -> ${newStatus}`,
  );

  return updated;
};

// ---------- Section Assign (Moderator/Admin) ----------
const assignSection = async (memberId: string, sectionId: string, actorId: string) => {
  const member = await prisma.memberProfile.findFirst({
    where: { id: memberId, deletedAt: null },
  });

  if (!member) {
    throw new ApiError(404, 'Member not found');
  }

  const section = await prisma.section.findFirst({
    where: { id: sectionId, deletedAt: null },
  });

  if (!section) {
    throw new ApiError(404, 'Section not found');
  }

  const updated = await prisma.memberProfile.update({
    where: { id: memberId },
    data: { sectionId },
    include: { section: { select: { id: true, name: true } } },
  });

  await createAuditLog(
    actorId,
    'MEMBER_SECTION_ASSIGNED',
    'MemberProfile',
    memberId,
    `section: ${section.name}`,
  );

  return updated;
};

// ---------- Soft Delete (Admin) — ডাটাবেস থেকে আসলে মুছছে না, শুধু deletedAt সেট করছে ----------
const softDeleteMember = async (memberId: string, actorId: string) => {
  const member = await prisma.memberProfile.findFirst({
    where: { id: memberId, deletedAt: null },
  });

  if (!member) {
    throw new ApiError(404, 'Member not found');
  }

  await prisma.memberProfile.update({
    where: { id: memberId },
    data: { deletedAt: new Date(), membershipStatus: 'INACTIVE' },
  });

  await createAuditLog(actorId, 'MEMBER_DELETED', 'MemberProfile', memberId);
};

export const MemberService = {
  createMyProfile,
  getMyProfile,
  updateMyProfile,
  getPublicMembers,
  getPublicMemberById,
  updateMembershipStatus,
  assignSection,
  softDeleteMember,
};