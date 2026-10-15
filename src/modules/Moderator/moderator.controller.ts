import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { IPaginationOptions } from '../../interface/common';
import { ModeratorService } from './moderator.service';
import { IModeratorFilters } from './moderator.interface';

const createModerator = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await ModeratorService.createModerator(actor, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Moderator panel created successfully',
    data: result,
  });
});

const getAllModerators = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'status', 'type']) as IModeratorFilters;
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;

  const result = await ModeratorService.getAllModerators(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Moderator panels fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleModerator = catchAsync(async (req: Request, res: Response) => {
  // optionalAuth থেকে এসেছে — guest হলে user undefined
  const requesterRole = (req as any).user?.role;
  const result = await ModeratorService.getSingleModerator(req.params.id, requesterRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Moderator panel fetched successfully',
    data: result,
  });
});

const updateModerator = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await ModeratorService.updateModerator(actor, req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Moderator panel updated successfully',
    data: result,
  });
});

const updateModeratorStatus = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await ModeratorService.updateModeratorStatus(actor, req.params.id, req.body.status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Moderator panel status updated successfully',
    data: result,
  });
});

const softDeleteModerator = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  await ModeratorService.softDeleteModerator(actor, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Moderator panel deleted successfully',
  });
});

const addMember = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await ModeratorService.addMember(actor, req.params.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Member added to the panel successfully',
    data: result,
  });
});

const updateMember = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await ModeratorService.updateMember(actor, req.params.memberId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Panel member updated successfully',
    data: result,
  });
});

const removeMember = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  await ModeratorService.removeMember(actor, req.params.memberId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Member removed from the panel successfully',
  });
});

export const ModeratorController = {
  createModerator,
  getAllModerators,
  getSingleModerator,
  updateModerator,
  updateModeratorStatus,
  softDeleteModerator,
  addMember,
  updateMember,
  removeMember,
};