import { z } from 'zod';

const generateDuesZod = z.object({
  body: z.object({
    month: z
      .number({ required_error: 'Month is required' })
      .int()
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12'),
    year: z.number({ required_error: 'Year is required' }).int().min(2024).max(2100),
    amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be greater than 0'),
  }),
});

const initiatePaymentZod = z.object({
  body: z.object({
    dueId: z.string({ required_error: 'Due id is required' }).uuid('Invalid due id'),
  }),
});

// bKash ব্যবহারকারীর ব্রাউজারকে পাঠায়: /bkash/callback?paymentID=...&status=success
// এখানে body না, query যাচাই হচ্ছে
const bkashCallbackZod = z.object({
  query: z.object({
    paymentID: z.string({ required_error: 'paymentID is required' }).min(1),
    status: z.enum(['success', 'failure', 'cancel'], {
      required_error: 'status is required',
      invalid_type_error: 'status must be success, failure or cancel',
    }),
  }),
});

// URL এর :id সঠিক UUID কিনা
const paymentIdParamZod = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment id'),
  }),
});

export const PaymentValidation = {
  generateDuesZod,
  initiatePaymentZod,
  bkashCallbackZod,
  paymentIdParamZod,
};