import { PrismaClient } from '@/prisma/generated/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ||
  new PrismaClient({ accelerateUrl: process.env.DATABASE_URL! });
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
