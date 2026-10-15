import { z } from 'zod';

const dateString = (message: string) =>
  z.string({ required_error: message }).refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

const createModeratorZod = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1),
    type: z.string({ required_error: 'Type is required' }).min(1),
    tenureStart: dateString('Tenure start is required'),
    tenureEnd: dateString('Tenure end is required').optional(),
  }),
});

const updateModeratorZod = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    tenureStart: dateString('Tenure start is required').optional(),
    tenureEnd: dateString('Tenure end is required').optional(),
  }),
});

const updateStatusZod = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE'], { required_error: 'Status is required' }),
  }),
});

const addMemberZod = z.object({
  body: z.object({
    userId: z.string({ required_error: 'User id is required' }).uuid('Invalid user id'),
    position: z.string({ required_error: 'Position is required' }).min(1),
  }),
});

const updateMemberZod = z.object({
  body: z.object({
    position: z.string({ required_error: 'Position is required' }).min(1),
  }),
});

export const ModeratorValidation = {
  createModeratorZod,
  updateModeratorZod,
  updateStatusZod,
  addMemberZod,
  updateMemberZod,
};