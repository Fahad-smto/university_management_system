import { MembershipStatus } from '@prisma/client';

export type ICreateMemberProfilePayload = {
  studentIdNo: string;
  session: string;
  class: string;
  sectionId?: string;
};

export type IUpdateMemberProfilePayload = {
  name?: string;
  phone?: string;
  session?: string;
  class?: string;
};

// public directory এর filter গুলো
export type IMemberFilters = {
  searchTerm?: string;
  sectionId?: string;
  session?: string;
  class?: string;
};

export type IUpdateStatusPayload = {
  status: MembershipStatus;
};

export type IAssignSectionPayload = {
  sectionId: string;
};