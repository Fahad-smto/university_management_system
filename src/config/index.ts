import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  redis: {
    user: process.env.redis_user,
    password: process.env.redis_password,
    host: process.env.redis_host,
    port: process.env.redis_port,
  },

  seed: {
    super_admin: {
      name: process.env.SUPER_ADMIN_NAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
    },
    admin: {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
    moderator: {
      name: process.env.MODERATOR_NAME,
      email: process.env.MODERATOR_EMAIL,
      password: process.env.MODERATOR_PASSWORD,
    },
  }, // ← seed এর closing brace এখন এখানে, email বাদ দিয়ে

  // email ব্লকটা এখন top-level এ, seed এর বাইরে
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
    bkash: {
    base_url: process.env.BKASH_BASE_URL,
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
    app_key: process.env.BKASH_APP_KEY,
    app_secret: process.env.BKASH_APP_SECRET,
    callback_url: process.env.BKASH_CALLBACK_URL,
  },
};

export default config;