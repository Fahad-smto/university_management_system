import crypto from 'crypto';

// crypto.randomInt নিরাপদ random সংখ্যা দেয় (Math.random() এর চেয়ে ভালো — cryptographically secure)
export const generateOtp = (): string => {
  const otp = crypto.randomInt(100000, 999999); // 6-digit সংখ্যা
  return otp.toString();
};

export default generateOtp;
