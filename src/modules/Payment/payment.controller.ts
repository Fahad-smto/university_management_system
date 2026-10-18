import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { IPaginationOptions } from '../../interface/common';
import { PaymentService } from './payment.service';
import { IDueFilters, IPaymentFilters } from './payment.interface';

const generateMonthlyDues = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await PaymentService.generateMonthlyDues(actor, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Monthly dues generated successfully',
    data: result,
  });
});

const getAllDues = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['status', 'month', 'year']) as IDueFilters;
  const options = pick(req.query, ['page', 'limit']) as IPaginationOptions;

  const result = await PaymentService.getAllDues(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dues fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyDues = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const filters = pick(req.query, ['status', 'month', 'year']) as IDueFilters;
  const options = pick(req.query, ['page', 'limit']) as IPaginationOptions;

  const result = await PaymentService.getMyDues(userId, filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your dues fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await PaymentService.initiatePayment(userId, req.body.dueId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment started. Open bkashURL in a browser to pay',
    data: result,
  });
});

// bKash ব্যবহারকারীর ব্রাউজারকে এখানে পাঠায়, তাই এখানে login লাগে না।
// ফ্রন্টএন্ড থাকলে এখানে JSON না দিয়ে ফ্রন্টএন্ডের success/failure পেজে redirect করা হয়
const bkashCallback = catchAsync(async (req: Request, res: Response) => {
  const paymentID = req.query.paymentID as string | undefined;
  const status = req.query.status as string | undefined;

  const payment = await PaymentService.handleBkashCallback(paymentID, status);

  sendResponse(res, {
    statusCode: 200,
    success: payment?.status === 'SUCCESS',
    message: `Payment ${payment?.status.toLowerCase()}`,
    data: payment,
  });
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await PaymentService.verifyPayment(actor, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment status checked',
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const filters = pick(req.query, ['status']) as IPaymentFilters;
  const options = pick(req.query, ['page', 'limit']) as IPaginationOptions;

  const result = await PaymentService.getMyPayments(userId, filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your payments fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['status', 'userId']) as IPaymentFilters;
  const options = pick(req.query, ['page', 'limit']) as IPaginationOptions;

  const result = await PaymentService.getAllPayments(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await PaymentService.getSinglePayment(actor, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment fetched successfully',
    data: result,
  });
});

export const PaymentController = {
  generateMonthlyDues,
  getAllDues,
  getMyDues,
  initiatePayment,
  bkashCallback,
  verifyPayment,
  getMyPayments,
  getAllPayments,
  getSinglePayment,
};