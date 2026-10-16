import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { NoticeService } from './notice.service';
import { IAuthUser } from './notice.interface';

const createNotice = catchAsync(async (req, res) => {
  const result = await NoticeService.createNotice(req.user as IAuthUser, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Notice published successfully',
    data: result,
  });
});

const getAllNotices = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['searchTerm', 'category', 'moderatorId']);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await NoticeService.getAllNotices(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notices retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleNotice = catchAsync(async (req, res) => {
  const result = await NoticeService.getSingleNotice(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notice retrieved successfully',
    data: result,
  });
});

const updateNotice = catchAsync(async (req, res) => {
  const result = await NoticeService.updateNotice(req.user as IAuthUser, req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notice updated successfully',
    data: result,
  });
});

const deleteNotice = catchAsync(async (req, res) => {
  await NoticeService.softDeleteNotice(req.user as IAuthUser, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notice deleted successfully',
    data: null,
  });
});

export const NoticeController = {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNotice,
  deleteNotice,
};