import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buildAdapter(): PrismaMariaDb {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is missing");

  const url = new URL(raw);
  if (url.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must start with mysql://");
  }

  const isDevelopment = process.env.NODE_ENV !== "production";

  // Increase pool for development (hot reloads create multiple instances)
  // Production: normal pool size, Development: larger pool to handle reloads
  const connectionLimit = isDevelopment ? 30 : 10;
  const connectTimeout = isDevelopment ? 20000 : 10000;

  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit,
    connectTimeout,
    idleTimeout: 30,
  });
}

function initializePrisma(): PrismaClient {
  return new PrismaClient({
    adapter: buildAdapter(),
    log:
      process.env.NODE_ENV !== "production"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? initializePrisma();

// Ensure singleton in development to avoid connection pool exhaustion
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
