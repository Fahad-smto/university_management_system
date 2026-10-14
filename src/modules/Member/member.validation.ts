import { z } from 'zod';

const createProfileZod = z.object({
  body: z.object({
    studentIdNo: z.string({ required_error: 'Student ID is required' }).min(1),
    session: z.string({ required_error: 'Session is required' }).min(1),
    class: z.string({ required_error: 'Class is required' }).min(1),
    sectionId: z.string().uuid('Invalid section id').optional(),
  }),
});

const updateProfileZod = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    session: z.string().min(1).optional(),
    class: z.string().min(1).optional(),
  }),
});

const updateStatusZod = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'EXPIRED'], {
      required_error: 'Status is required',
    }),
  }),
});

const assignSectionZod = z.object({
  body: z.object({
    sectionId: z.string({ required_error: 'Section id is required' }).uuid('Invalid section id'),
  }),
});

export const MemberValidation = {
  createProfileZod,
  updateProfileZod,
  updateStatusZod,
  assignSectionZod,
};