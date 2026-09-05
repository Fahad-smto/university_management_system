import { Request, Response } from 'express';
// import catchAsync from '../../shared/catchAsync';
// import sendResponse from '../../shared/sendResponse';
// import pick from '../../shared/pick';
// import { moderatorService } from './moderator.service';

// Moderator (panel) + ModeratorMember controller functions live together here
// since members only ever exist in the context of a moderator panel.

export const moderatorController = {
  // ---- Moderator ----
  // createModerator: catchAsync(async (req: Request, res: Response) => {}),
  // getAllModerators: catchAsync(async (req: Request, res: Response) => {}),
  // getSingleModerator: catchAsync(async (req: Request, res: Response) => {}),
  // updateModerator: catchAsync(async (req: Request, res: Response) => {}),
  // softDeleteModerator: catchAsync(async (req: Request, res: Response) => {}),

  // ---- ModeratorMember (info only — assigned by admin, not by election) ----
  // addMember: catchAsync(async (req: Request, res: Response) => {}),
  // getMembers: catchAsync(async (req: Request, res: Response) => {}),
  // updateMember: catchAsync(async (req: Request, res: Response) => {}),
  // removeMember: catchAsync(async (req: Request, res: Response) => {}),
};
