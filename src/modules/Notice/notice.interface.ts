// req.user থেকে যা আসে
export type IAuthUser = {
  id: string;
  role: string;
};

export type ICreateNoticePayload = {
  title: string;
  content: string;
  category?: string; // GENERAL, EVENT, ELECTION, URGENT
  publishedAt?: string; // না দিলে এখনই publish, ভবিষ্যতের তারিখ দিলে schedule হবে
};

export type IUpdateNoticePayload = {
  title?: string;
  content?: string;
  category?: string;
  publishedAt?: string;
};

export type INoticeFilters = {
  searchTerm?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
};