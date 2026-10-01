import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import prisma from './lib/prisma';
import config from './config';

type IRole = Role;

type ISeedUserInput = {
  role: IRole;
  name?: string;
  email?: string;
  password?: string;
};

// একটা নির্দিষ্ট role এর ইউজার আগে থেকে আছে কিনা চেক করে,
// না থাকলে .env এর তথ্য দিয়ে তৈরি করে
const seedUserByRole = async ({ role, name, email, password }: ISeedUserInput) => {
  // .env এ credential সেট করা না থাকলে এই role স্কিপ করা হবে
  if (!email || !password) {
    console.log(`[seed] Skipped ${role} — email/password not set in .env`);
    return;
  }

  // এই role এর কমপক্ষে একজন ইউজার ডাটাবেসে আছে কিনা দেখা
  const existingUser = await prisma.user.findFirst({ where: { role } });

  if (existingUser) {
    console.log(`[seed] ${role} already exists (${existingUser.email}) — skipping`);
    return;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 12,
  );

  const createdUser = await prisma.user.create({
    data: {
      name: name || role,
      email,
      password: hashedPassword,
      role,
      authProvider: 'CREDENTIALS',
    },
  });

  console.log(`[seed] ${role} created → ${createdUser.email}`);
};

// server.ts থেকে এই একটা ফাংশনই কল হবে: await seed()
const seed = async (): Promise<void> => {
      console.log('DEBUG seed config:', config.seed); 
  await seedUserByRole({ role: 'SUPER_ADMIN', ...config.seed.super_admin });
  await seedUserByRole({ role: 'ADMIN', ...config.seed.admin });
  await seedUserByRole({ role: 'MODERATOR', ...config.seed.moderator });
};

export default seed;