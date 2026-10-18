import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { IPaginationOptions } from '../../interface/common';
import { UserService } from './user.service';
import { IUserFilters } from './user.interface';

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMe((req as any).user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMe((req as any).user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'role', 'isBlocked']) as IUserFilters;
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;

  const result = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUser(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await UserService.changeUserRole(actor, req.params.id, req.body.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User role updated successfully',
    data: result,
  });
});

const setBlockStatus = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await UserService.setBlockStatus(actor, req.params.id, req.body.isBlocked);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: req.body.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  await UserService.softDeleteUser(actor, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
  });
});


const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await UserService.updateProfileImage(userId, req.file);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile image updated successfully',
    data: result,
  });
});

const deleteProfileImage = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  await UserService.deleteProfileImage(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile image removed successfully',
  });
});



export const UserController = {
  getMe,
  updateMe,
  getAllUsers,
  getSingleUser,
  changeUserRole,
  setBlockStatus,
  softDeleteUser,
  updateProfileImage,
  deleteProfileImage,
};