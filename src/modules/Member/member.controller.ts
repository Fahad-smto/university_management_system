import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { IPaginationOptions } from '../../interface/common';
import { MemberService } from './member.service';
import { IMemberFilters } from './member.interface';

const createMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await MemberService.createMyProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Member profile created. Waiting for moderator approval',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await MemberService.getMyProfile(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await MemberService.updateMyProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getPublicMembers = catchAsync(async (req: Request, res: Response) => {
  // query থেকে শুধু অনুমোদিত field গুলো তুলে নেওয়া হচ্ছে
  const filters = pick(req.query, ['searchTerm', 'sectionId', 'session', 'class']) as IMemberFilters;
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;

  // optionalAuth থেকে এসেছে — guest হলে user undefined
  const requesterRole = (req as any).user?.role;

  const result = await MemberService.getPublicMembers(filters, options, requesterRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Members fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getPublicMemberById = catchAsync(async (req: Request, res: Response) => {
  const requesterRole = (req as any).user?.role;
  const result = await MemberService.getPublicMemberById(req.params.id, requesterRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Member fetched successfully',
    data: result,
  });
});

const updateMembershipStatus = catchAsync(async (req: Request, res: Response) => {
  const actorId = (req as any).user.id;
  const result = await MemberService.updateMembershipStatus(req.params.id, req.body.status, actorId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Membership status updated successfully',
    data: result,
  });
});

const assignSection = catchAsync(async (req: Request, res: Response) => {
  const actorId = (req as any).user.id;
  const result = await MemberService.assignSection(req.params.id, req.body.sectionId, actorId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Section assigned successfully',
    data: result,
  });
});

const softDeleteMember = catchAsync(async (req: Request, res: Response) => {
  const actorId = (req as any).user.id;
  await MemberService.softDeleteMember(req.params.id, actorId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Member deleted successfully',
  });
});

export const MemberController = {
  createMyProfile,
  getMyProfile,
  updateMyProfile,
  getPublicMembers,
  getPublicMemberById,
  updateMembershipStatus,
  assignSection,
  softDeleteMember,
};