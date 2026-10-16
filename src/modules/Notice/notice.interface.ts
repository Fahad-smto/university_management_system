import { NoticeCategory } from '@prisma/client';

export type IAuthUser = {
  id: string;
  role: string;
};

export type ICreateNoticePayload = {
  moderatorId: string;
  title: string;
  content: string;
  category?: NoticeCategory;
};

export type IUpdateNoticePayload = {
  title?: string;
  content?: string;
  category?: NoticeCategory;
};

export type INoticeFilters = {
  searchTerm?: string;
  category?: string;
  moderatorId?: string;
};