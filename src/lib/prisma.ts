import { PrismaClient } from '@prisma/client';

// Single shared Prisma Client instance for the whole app
const prisma = new PrismaClient();

export default prisma;
