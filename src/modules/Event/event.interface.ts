import { EventStatus } from '@prisma/client';

// req.user থেকে যা আসে
export type IAuthUser = {
  id: string;
  role: string;
};

export type ICreateEventPayload = {
  title: string;
  description?: string;
  venue: string;
  eventDate: string; // ISO date string, যেমন "2026-12-20T10:00:00.000Z"
  fee?: number;
  capacity?: number;
};

export type IUpdateEventPayload = {
  title?: string;
  description?: string;
  venue?: string;
  eventDate?: string;
  fee?: number;
  capacity?: number;
};

export type IUpdateEventStatusPayload = {
  status: EventStatus;
};

export type IEventFilters = {
  searchTerm?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
};

export type IRegistrationFilters = {
  status?: string;
};