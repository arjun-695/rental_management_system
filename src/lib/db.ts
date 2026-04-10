import { PrismaClient } from "@/generated/prisma";

// Next.js hot reload can create many Prisma instances.
// We cache one global instance to prevent connection exhaustion
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Explicit type ensures every consumer gets a PrismaClient.
export const prisma: PrismaClient = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}