import { z } from 'zod';

const CATEGORIES = ['GENERAL', 'EVENT', 'ELECTION', 'URGENT'] as const;

const dateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

const createNoticeZod = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty').max(200),
    content: z.string({ required_error: 'Content is required' }).min(1, 'Content cannot be empty'),
    category: z.enum(CATEGORIES).optional(),
    publishedAt: dateString.optional(),
  }),
});

const updateNoticeZod = z.object({
  body: z
    .object({
      title: z.string().min(1).max(200).optional(),
      content: z.string().min(1).optional(),
      category: z.enum(CATEGORIES).optional(),
      publishedAt: dateString.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

export const NoticeValidation = {
  createNoticeZod,
  updateNoticeZod,
};