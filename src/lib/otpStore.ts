import {redis} from '../lib/redis';

const OTP_PREFIX = 'otp:forgot-password:';
const OTP_TTL_SECONDS = 5 * 60; // ৫ মিনিট

// প্রতিটা ইউজারের OTP আলাদা key তে রাখা হয় — email দিয়ে key বানানো হচ্ছে
const getOtpKey = (email: string): string => `${OTP_PREFIX}${email}`;

// OTP Redis এ সেভ করা — ৫ মিনিট পর key নিজে থেকেই মুছে যাবে (TTL)
export const saveOtp = async (email: string, otp: string): Promise<void> => {
  const key = getOtpKey(email);
  // 'EX' মানে expiry সেকেন্ডে সেট করা — এটাই "৫ মিনিট পর vanish" এর আসল জায়গা
await redis.set(key, otp, {'EX': OTP_TTL_SECONDS});
};

// OTP মিলছে কিনা চেক করা — মিললে true রিটার্ন করবে
export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const key = getOtpKey(email);
  const storedOtp = await redis.get(key);

  // key টাই না থাকলে মানে হয় কখনো OTP পাঠানো হয়নি, নয়তো মেয়াদ শেষ (expire) হয়ে গেছে
  if (!storedOtp) {
    return false;
  }

  return storedOtp === otp;
};

// OTP ব্যবহার হয়ে গেলে সাথে সাথে মুছে ফেলা — যাতে একই OTP দ্বিতীয়বার ব্যবহার করা না যায়
export const deleteOtp = async (email: string): Promise<void> => {
  const key = getOtpKey(email);
  await redis.del(key);
};