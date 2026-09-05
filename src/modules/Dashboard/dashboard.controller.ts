import { Request, Response } from 'express';
// import catchAsync from '../../shared/catchAsync';
// import sendResponse from '../../shared/sendResponse';
// import { dashboardService } from './dashboard.service';

// All dashboard endpoints (guest/user/moderator/admin) live together here
// since each is just a thin controller calling its matching service function.

export const dashboardController = {
  // Public — no auth required
  // getGuestDashboard: catchAsync(async (req: Request, res: Response) => {
  //   const result = await dashboardService.getGuestDashboard();
  //   sendResponse(res, { statusCode: 200, success: true, message: 'Guest dashboard fetched', data: result });
  // }),

  // Member/Student — auth('MEMBER')
  // getUserDashboard: catchAsync(async (req: Request, res: Response) => {
  //   const result = await dashboardService.getUserDashboard(req.user.id);
  //   sendResponse(res, { statusCode: 200, success: true, message: 'User dashboard fetched', data: result });
  // }),

  // Moderator — auth('MODERATOR')
  // getModeratorDashboard: catchAsync(async (req: Request, res: Response) => {
  //   const result = await dashboardService.getModeratorDashboard(req.user.id);
  //   sendResponse(res, { statusCode: 200, success: true, message: 'Moderator dashboard fetched', data: result });
  // }),

  // Admin — auth('ADMIN')
  // getAdminDashboard: catchAsync(async (req: Request, res: Response) => {
  //   const result = await dashboardService.getAdminDashboard();
  //   sendResponse(res, { statusCode: 200, success: true, message: 'Admin dashboard fetched', data: result });
  // }),
};
