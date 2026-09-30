import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import ApiError from '../errors/ApiError';
import handleZodError from '../errors/handleZodError';
import { IGenericErrorMessage } from '../interface/error';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorMessages: IGenericErrorMessage[] = [];

  if (err instanceof ZodError) {
    const simplified = handleZodError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    // unique constraint violation (যেমন duplicate email)
    statusCode = 400;
    message = 'Duplicate entry — this value already exists';
    errorMessages = [{ path: (err.meta?.target as string[])?.[0] || '', message }];
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = message ? [{ path: '', message }] : [];
  } else if (err instanceof Error) {
    message = err.message;
    errorMessages = message ? [{ path: '', message }] : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errorMessages,
  });
};

export default globalErrorHandler;