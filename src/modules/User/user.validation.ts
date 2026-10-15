import { z } from 'zod';

const updateMeZod = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').optional(),
      phone: z.string().min(5, 'Invalid phone number').optional(),
    })
    .refine((body) => body.name !== undefined || body.phone !== undefined, {
      message: 'Provide at least one field to update',
    }),
});

// SUPER_ADMIN role কাউকে দেওয়া যাবে না (শুধু seed থেকে তৈরি হয়)
const changeRoleZod = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER'], { required_error: 'Role is required' }),
  }),
});

const blockUserZod = z.object({
  body: z.object({
    isBlocked: z.boolean({ required_error: 'isBlocked (true/false) is required' }),
  }),
});

export const UserValidation = {
  updateMeZod,
  changeRoleZod,
  blockUserZod,
};