import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import config from '../../config';
import { AuthService } from './auth.service';

const isProduction = config.env === 'production';

// cookie options — httpOnly মানে JavaScript দিয়ে ব্রাউজার থেকে এই কুকি পড়া যাবে না (XSS থেকে সুরক্ষা)
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction, // production এ শুধু HTTPS এ পাঠাবে
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // ১ দিন
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // ৩০ দিন
};

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await AuthService.login(req.body);

  // দুটো টোকেনই httpOnly cookie হিসেবে পাঠানো হচ্ছে
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged in successfully',
    data: { accessToken, refreshToken },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged out successfully',
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await AuthService.googleLogin(req.body);

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Google login successful',
    data: { accessToken },
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  googleLogin,
};