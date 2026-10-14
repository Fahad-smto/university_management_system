import { NextFunction, Request, Response } from 'express';
import { jwtHelpers } from '../utils/jwtHelpers';
import config from '../config';

// token থাকলে req.user সেট করবে, না থাকলে বা ভুল হলে error না দিয়ে guest হিসেবে এগিয়ে যাবে
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      (req as any).user = jwtHelpers.verifyToken(token, config.jwt.access_secret as string);
    }
  } catch (error) {
    // token ভুল/মেয়াদোত্তীর্ণ হলে guest হিসেবেই ধরা হবে
  }

  next();
};

export default optionalAuth;