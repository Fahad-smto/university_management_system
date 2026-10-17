import { z } from 'zod';

const dateString = z
  .string({ required_error: 'Event date is required' })
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

const createEventZod = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1),
    description: z.string().optional(),
    venue: z.string({ required_error: 'Venue is required' }).min(1),
    eventDate: dateString,
    fee: z.number().min(0, 'Fee cannot be negative').optional(),
    capacity: z.number().int().positive('Capacity must be at least 1').optional(),
  }),
});

const updateEventZod = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    venue: z.string().min(1).optional(),
    eventDate: dateString.optional(),
    fee: z.number().min(0).optional(),
    capacity: z.number().int().positive().optional(),
  }),
});

const updateStatusZod = z.object({
  body: z.object({
    status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'], {
      required_error: 'Status is required',
    }),
  }),
});

export const EventValidation = {
  createEventZod,
  updateEventZod,
  updateStatusZod,
};