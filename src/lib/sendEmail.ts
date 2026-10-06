import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port) || 587,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// সাধারণ plain-text email পাঠানোর ফাংশন — subject আর text নেয়
export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  if (!config.email.host || !config.email.user) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from || config.email.user,
      to,
      subject,
      text,
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('EMAIL SEND FAILED:', error);
  }
};

// ---------- OTP পাঠানোর জন্য styled HTML email ----------
export const sendOtpEmail = async (to: string, name: string, otp: string): Promise<void> => {
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">College Org Management</h1>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #333333;">Hi ${name},</p>
        <p style="font-size: 15px; color: #555555; line-height: 1.6;">
          You requested to reset your password. Use the OTP below to continue.
          This code will expire in <strong>5 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; background-color: #f4f4f7; padding: 16px 32px; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #4f46e5; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; color: #999999; line-height: 1.6;">
          If you did not request this, you can safely ignore this email — your password will remain unchanged.
        </p>
      </div>
      <div style="background-color: #f4f4f7; padding: 16px 24px; text-align: center;">
        <p style="font-size: 12px; color: #aaaaaa; margin: 0;">© ${new Date().getFullYear()} College Org Management System</p>
      </div>
    </div>
  </div>
  `;

  if (!config.email.host || !config.email.user) {
    console.log(`[DEV EMAIL] To: ${to} | OTP: ${otp} (SMTP not configured — shown here instead)`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from || config.email.user,
      to,
      subject: 'Your Password Reset OTP',
      html,
    });
    console.log('OTP email sent successfully:', info.messageId);
  } catch (error) {
    console.error('OTP EMAIL SEND FAILED:', error);
  }
};

// ---------- পাসওয়ার্ড পরিবর্তনের পর নিরাপত্তা নোটিফিকেশন — এটাই মিসিং ছিল ----------
export const sendPasswordChangedEmail = async (to: string, name: string): Promise<void> => {
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <div style="background-color: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">College Org Management</h1>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #333333;">Hi ${name},</p>
        <p style="font-size: 15px; color: #555555; line-height: 1.6;">
          Your account password was just <strong>successfully changed</strong>.
        </p>
        <p style="font-size: 13px; color: #999999; line-height: 1.6;">
          If you made this change, you can safely ignore this email.
          If you did <strong>not</strong> change your password, please contact support immediately.
        </p>
      </div>
      <div style="background-color: #f4f4f7; padding: 16px 24px; text-align: center;">
        <p style="font-size: 12px; color: #aaaaaa; margin: 0;">© ${new Date().getFullYear()} College Org Management System</p>
      </div>
    </div>
  </div>
  `;

  if (!config.email.host || !config.email.user) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: Password Changed`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from || config.email.user,
      to,
      subject: 'Your password was changed',
      html,
    });
    console.log('Password change email sent successfully:', info.messageId);
  } catch (error) {
    console.error('PASSWORD CHANGE EMAIL FAILED:', error);
  }
};