// import prisma from '../../lib/prisma';
// import {
//   IGuestDashboard,
//   IUserDashboard,
//   IModeratorDashboard,
//   IAdminDashboard,
// } from './dashboard.interface';

// All aggregation logic (guest/user/moderator/admin) lives together here.
// Each function only reads from other modules' Prisma models — this module
// owns no table of its own.

export const dashboardService = {
	// TODO: aggregate public notices, upcoming events, upcoming/latest election info
	// getGuestDashboard: async (): Promise<IGuestDashboard> => {},
	// TODO: aggregate the logged-in member's own data — membership status,
	// current month's due, payment history, registered/upcoming events,
	// active election info, own complaints
	// getUserDashboard: async (userId: string): Promise<IUserDashboard> => {},
	// TODO: aggregate pending complaints, own moderator's events, own moderator's notices
	// getModeratorDashboard: async (moderatorId: string): Promise<IModeratorDashboard> => {},
	// TODO: aggregate total/active members, total revenue (sum of successful payments),
	// pending complaints count, upcoming events count, recent audit logs
	// getAdminDashboard: async (): Promise<IAdminDashboard> => {},
};
