import { Role } from '@prisma/client';

// req.user থেকে যা আসে
export type IAuthUser = {
  id: string;
  role: string;
};

export type IUpdateMePayload = {
  name?: string;
  phone?: string;
};

export type IUserFilters = {
  searchTerm?: string;
  role?: string;
  isBlocked?: string; // query থেকে "true" / "false" string হিসেবে আসে
};

export type IChangeRolePayload = {
  role: Role;
};

export type IBlockUserPayload = {
  isBlocked: boolean;
};