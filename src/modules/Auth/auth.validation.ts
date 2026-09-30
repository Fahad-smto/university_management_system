import { z } from 'zod';

const registerZod = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string({ required_error: 'Phone number is required' }).min(10, 'Phone number must be at least 10 digits'),
  }),
});

const loginZod = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const AuthValidation = {
  registerZod,
  loginZod,
};