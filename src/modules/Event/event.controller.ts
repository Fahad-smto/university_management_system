import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { IPaginationOptions } from '../../interface/common';
import { EventService } from './event.service';
import { IEventFilters, IRegistrationFilters } from './event.interface';

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await EventService.createEvent(actor, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Event created successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'searchTerm',
    'status',
    'moderatorId',
    'fromDate',
    'toDate',
  ]) as IEventFilters;
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;

  const result = await EventService.getAllEvents(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Events fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getSingleEvent(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event fetched successfully',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await EventService.updateEvent(actor, req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event updated successfully',
    data: result,
  });
});

const updateEventStatus = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const result = await EventService.updateEventStatus(actor, req.params.id, req.body.status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event status updated successfully',
    data: result,
  });
});

const softDeleteEvent = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  await EventService.softDeleteEvent(actor, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event deleted successfully',
  });
});

const registerForEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await EventService.registerForEvent(userId, req.params.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Registered for the event successfully',
    data: result,
  });
});

const cancelRegistration = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  await EventService.cancelRegistration(userId, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Registration cancelled successfully',
  });
});

const getRegistrations = catchAsync(async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const filters = pick(req.query, ['status']) as IRegistrationFilters;
  const options = pick(req.query, ['page', 'limit', 'sortOrder']) as IPaginationOptions;

  const result = await EventService.getRegistrations(actor, req.params.id, filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Registrations fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyRegistrations = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const options = pick(req.query, ['page', 'limit', 'sortOrder']) as IPaginationOptions;

  const result = await EventService.getMyRegistrations(userId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your registrations fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  updateEventStatus,
  softDeleteEvent,
  registerForEvent,
  cancelRegistration,
  getRegistrations,
  getMyRegistrations,
};