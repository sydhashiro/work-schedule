import { PrismaClient } from '@prisma/client';

// Attach PrismaClient to globalThis in dev to prevent multiple instances
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient =
  global.prisma ??
  new PrismaClient({
    log: ['error'], // use 'query' or 'info' if you want verbose logs
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}

export const prisma = prismaClient;
