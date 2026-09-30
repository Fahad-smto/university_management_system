import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../utils/jwtHelpers';
import { googleClient } from '../../lib/googleAuth';
import { IRegisterPayload, ILoginPayload, IgoogleLoginpayload } from './auth.interface';

// ---------- Manual Register ----------
const register = async (payload: IRegisterPayload) => {
  // ১. একই ইমেইলে আগে থেকে অ্যাকাউন্ট আছে কিনা চেক করা
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  // ২. পাসওয়ার্ড কখনো plain text এ সেভ করা যাবে না — hash করতে হবে
  const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  // ৩. ইউজার তৈরি করা
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      authProvider: 'CREDENTIALS',
    },
  });

  // ৪. রেসপন্সে password ফেরত পাঠানো যাবে না
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// ---------- Manual Login ----------
const login = async (payload: ILoginPayload) => {
  // ১. ইমেইল দিয়ে ইউজার খোঁজা
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(404, 'No account found with this email');
  }

  if (!user.password) {
    // এই অ্যাকাউন্ট Google দিয়ে বানানো, password নাই
    throw new ApiError(400, 'This account uses Google login. Please sign in with Google');
  }

  // ২. দেওয়া পাসওয়ার্ড আর ডাটাবেসের hashed পাসওয়ার্ড মিলছে কিনা চেক
  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, 'Incorrect password');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'This account has been blocked');
  }

  // ৩. JWT payload বানানো (password কখনো এখানে রাখবেন না)
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // ৪. access token (কম মেয়াদ) আর refresh token (বেশি মেয়াদ) — দুটো আলাদা সাইন করা
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

// ---------- Refresh Token দিয়ে নতুন Access Token বানানো ----------
const refreshToken = async (token: string) => {
  let decoded;

  try {
    decoded = jwtHelpers.verifyToken(token, config.jwt.refresh_secret as string);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const { id } = decoded;

  // ইউজার এখনো আছে কিনা এবং blocked না তা নিশ্চিত করা
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

// ---------- Google Login (আপনার আগের লজিক, একটু সম্পূর্ণ করে দিলাম) ----------
const googleLogin = async (payload: IgoogleLoginpayload) => {
  const result = await googleClient.verifyIdToken({
    idToken: payload.idToken,
  });

  const googleInfo = result.getPayload();

  if (!googleInfo || !googleInfo.email) {
    throw new ApiError(400, 'Invalid Google token');
  }

  // এই ইমেইলে আগে থেকে ইউজার আছে কিনা দেখা, না থাকলে নতুন বানানো
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
		emailVerified:"true",
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

export const AuthService = {
  register,
  login,
  refreshToken,
  googleLogin,
};