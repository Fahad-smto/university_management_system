import { NextFunction, Request, Response } from 'express';
import ApiError from '../errors/ApiError';
import prisma from '../lib/prisma';
import { jwtHelpers } from '../utils/jwtHelpers';
import config from '../config';

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        throw new ApiError(401, 'You are not authorized. Please log in');
      }

      // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
      let decoded;
      try {
        decoded = jwtHelpers.verifyToken(token, config.jwt.access_secret as string);
      } catch (error) {
        throw new ApiError(401, 'Invalid or expired token. Please log in again');
      }

      // token এর তথ্যের উপর ভরসা না করে ডাটাবেস থেকে এখনকার অবস্থা দেখা হচ্ছে
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isBlocked: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        throw new ApiError(401, 'Account not found');
      }

      if (user.isBlocked) {
        throw new ApiError(403, 'This account has been blocked');
      }

      // role ডাটাবেস থেকে আসছে, তাই role বদলালে সাথে সাথে কার্যকর হবে
      (req as any).user = { id: user.id, email: user.email, role: user.role };

      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new ApiError(403, 'You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;