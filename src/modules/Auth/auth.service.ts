import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../utils/jwtHelpers';
import { googleClient } from '../../lib/googleAuth'; 
import type {
  IRegisterPayload,
  ILoginPayload,
  IForgotPasswordPayload,
  IResetPasswordPayload,
  IChangePasswordPayload,
} from './auth.interface';
import generateOtp from '../../lib/generateOtp';
import { deleteOtp, saveOtp, verifyOtp } from '../../lib/otpStore';
import { sendEmail, sendOtpEmail,sendPasswordChangedEmail } from '../../lib/sendEmail';

// ---------- Manual Register ----------
const register = async (payload: IRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      authProvider: 'CREDENTIALS',
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// ---------- Manual Login ----------
const login = async (payload: ILoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(404, 'No account found with this email');
  }

  if (!user.password) {
    throw new ApiError(400, 'This account uses Google login. Please sign in with Google');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, 'Incorrect password');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'This account has been blocked');
  }

  const jwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string,
  );

  const refreshToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string,
  );

  return { accessToken, refreshToken };
};

// ---------- Refresh Token ----------
const refreshToken = async (token: string) => {
  let decoded: { id: string };

  try {
    decoded = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as string,
    ) as { id: string };
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const { id } = decoded;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'This account has been blocked');
  }

  const newAccessToken = jwtHelpers.createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string,
  );

  return { accessToken: newAccessToken };
};

// ---------- Google Login ----------
const googleLogin = async (payload: { idToken: string }) => {
  const result = await googleClient.verifyIdToken({
    idToken: payload.idToken,
  });

  const googleInfo = result.getPayload();

  if (!googleInfo || !googleInfo.email) {
    throw new ApiError(400, 'Invalid Google token');
  }

  let user = await prisma.user.findUnique({
    where: { email: googleInfo.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: googleInfo.name || googleInfo.email,
        email: googleInfo.email,
        googleId: googleInfo.sub,
        authProvider: 'GOOGLE',
      },
    });
  }

  const jwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string,
  );

  const refreshTok = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string,
  );

  return { accessToken, refreshToken: refreshTok };
};

// ---------- Forgot Password — OTP জেনারেট করে Redis এ রেখে ইমেইলে পাঠানো ----------
const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  // নিরাপত্তার জন্য — ইউজার না থাকলেও error দিচ্ছি না
  // (এতে কেউ বুঝতে পারবে না কোন ইমেইল সিস্টেমে রেজিস্টার্ড আছে)
  if (!user) {
    return;
  }

  // ১. 6-digit OTP জেনারেট করা
  const otp = generateOtp();

  // ২. Redis এ সেভ করা — ৫ মিনিট পর নিজে থেকেই মুছে যাবে
  await saveOtp(user.email, otp);

  // ৩. সুন্দর HTML email এ OTP পাঠানো
  await sendOtpEmail(user.email, user.name, otp);
};

// ---------- Reset Password — OTP verify করে নতুন পাসওয়ার্ড সেট করা ----------
const resetPassword = async (payload: IResetPasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid request');
  }

  // ১. Redis এ গিয়ে OTP মিলছে কিনা চেক (মেয়াদ শেষ হলে Redis এ key-ই পাওয়া যাবে না)
  const isOtpValid = await verifyOtp(payload.email, payload.otp);

  if (!isOtpValid) {
    throw new ApiError(400, 'Invalid or expired OTP. Please request a new one');
  }

  // ২. নতুন পাসওয়ার্ড hash করে সেভ করা
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds) || 12,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // ৩. OTP ব্যবহার হয়ে গেছে — Redis থেকে সাথে সাথে মুছে ফেলা, যাতে দ্বিতীয়বার ব্যবহার না হয়
  await deleteOtp(payload.email);

  // ৪. নিশ্চিতকরণ ইমেইল (ঐচ্ছিক কিন্তু ভালো practice)
  await sendEmail(
    user.email,
    'Your password was reset',
    `Hi ${user.name}, your password was successfully reset. If this wasn't you, please contact support immediately.`,
  );
  await sendPasswordChangedEmail(user.email, user.name);
};

// ---------- Change Password — লগইন করা ইউজার, OTP লাগবে না ----------
// এখানে OTP নেই কারণ ইউজার ইতিমধ্যে লগইন করা আছে (JWT verified),
// আর oldPassword মিলিয়ে দেখাটাই যথেষ্ট security — Forgot Password এর মতো
// "আমি সত্যিই এই ইমেইলের মালিক" প্রমাণ করার দরকার নেই এখানে।
const changePassword = async (payload: IChangePasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.password) {
    throw new ApiError(400, 'This account uses Google login and has no password set');
  }

  const isPasswordMatched = await bcrypt.compare(payload.oldPassword, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, 'Old password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds) || 12,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await sendEmail(
    user.email,
    'Your password was changed',
    `Hi ${user.name}, your account password was just changed. If this wasn't you, please contact support immediately.`,
  );
  await sendPasswordChangedEmail(user.email, user.name);
};

export const AuthService = {
  register,
  login,
  refreshToken,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
};