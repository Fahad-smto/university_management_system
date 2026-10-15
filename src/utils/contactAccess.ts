const PRIVILEGED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];

// যারা contact number (phone) দেখতে পারবে
export const canSeeContact = (role?: string): boolean => {
  return !!role && PRIVILEGED_ROLES.includes(role);
};