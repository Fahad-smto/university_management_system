import { z } from 'zod';

const registerZod = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

const loginZod = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const forgotPasswordZod = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
  }),
});

const resetPasswordZod = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
    otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be 6 digits'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

// change password এ OTP নেই — শুধু old password আর new password
const changePasswordZod = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

export const AuthValidation = {
  registerZod,
  loginZod,
  forgotPasswordZod,
  resetPasswordZod,
  changePasswordZod,
};