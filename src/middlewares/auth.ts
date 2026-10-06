import { NextFunction, Request, Response } from 'express';
import ApiError from '../errors/ApiError';
import { jwtHelpers } from '../utils/jwtHelpers';
import config from '../config';

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ১. accessToken cookie থেকে নেওয়া হচ্ছে (header থেকেও নেওয়া যায়, কিন্তু আমরা cookie ব্যবহার করছি)
      const token = req.cookies.accessToken;

      if (!token) {
        throw new ApiError(401, 'You are not authorized. Please log in');
      }

      // ২. টোকেন verify করা — ভুল/মেয়াদ শেষ হলে এখানেই exception throw হবে
      let decoded : any;
      try {
        decoded = jwtHelpers.verifyToken(token, config.jwt.access_secret as string);
      } catch (error) {
        throw new ApiError(401, 'Invalid or expired token. Please log in again');
      }

      // ৩. পরবর্তী middleware/controller এর জন্য req.user সেট করা
      (req as any).user = decoded;

      // ৪. নির্দিষ্ট role দেওয়া থাকলে চেক করা
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new ApiError(403, 'You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;