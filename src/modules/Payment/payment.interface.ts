// req.user থেকে যা আসে
export type IAuthUser = {
  id: string;
  role: string;
};

export type IGenerateDuesPayload = {
  month: number; // 1 থেকে 12
  year: number;
  amount: number;
};

export type IInitiatePaymentPayload = {
  dueId: string;
};

// query থেকে সব string হয়ে আসে
export type IDueFilters = {
  status?: string; // UNPAID, PAID, OVERDUE
  month?: string;
  year?: string;
};

export type IPaymentFilters = {
  status?: string; // PENDING, SUCCESS, FAILED, CANCELLED
  userId?: string;
};