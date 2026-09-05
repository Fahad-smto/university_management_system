import { NextFunction, Request, RequestHandler, Response } from 'express';

// Wraps async controller functions so thrown/rejected errors
// are forwarded to the global error handler instead of crashing the process
export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
};

export default catchAsync;
