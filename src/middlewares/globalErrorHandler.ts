import { NextFunction, Request, Response } from 'express';
import { IGenericErrorMessage } from '../interface/error';

// TODO: branch on error type (ZodError / Prisma errors / ApiError / generic)
// and build a consistent { success, message, errors } response
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = 500;
  const message = 'Something went wrong';
  const errorMessages: IGenericErrorMessage[] = [];

  // if (err instanceof ZodError) { ... }
  // else if (err instanceof ApiError) { ... }
  // else if (err.code?.startsWith('P')) { ... } // Prisma errors

  res.status(statusCode).json({
    success: false,
    message,
    errors: errorMessages,
  });
};

export default globalErrorHandler;
