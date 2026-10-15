import { ModeratorStatus } from '@prisma/client';

export type IAuthUser = {
  id: string;
  role: string;
};

export type ICreateModeratorPayload = {
  name: string;
  type: string; // যেমন EXECUTIVE, CULTURAL, SPORTS
  tenureStart: string;
  tenureEnd?: string;
};

export type IUpdateModeratorPayload = {
  name?: string;
  type?: string;
  tenureStart?: string;
  tenureEnd?: string;
};

export type IUpdateModeratorStatusPayload = {
  status: ModeratorStatus;
};

export type IModeratorFilters = {
  searchTerm?: string;
  status?: string;
  type?: string;
};

export type IAddMemberPayload = {
  userId: string;
  position: string;
};

export type IUpdateMemberPayload = {
  position: string;
};