import { z } from 'zod';

const categoryEnum = z.enum(['GENERAL', 'EVENT', 'ELECTION', 'URGENT']);

const createNoticeZod = z.object({
  body: z.object({
    moderatorId: z.string({ required_error: 'Moderator id is required' }).uuid('Invalid moderator id'),
    title: z.string({ required_error: 'Title is required' }).min(1).max(150),
    content: z.string({ required_error: 'Content is required' }).min(1),
    category: categoryEnum.optional(),
  }),
});

const updateNoticeZod = z.object({
  body: z
    .object({
      title: z.string().min(1).max(150).optional(),
      content: z.string().min(1).optional(),
      category: categoryEnum.optional(),
    })
    .refine(
      (b) => b.title !== undefined || b.content !== undefined || b.category !== undefined,
      'At least one field (title, content or category) is required',
    ),
});

export const NoticeValidation = { createNoticeZod, updateNoticeZod };