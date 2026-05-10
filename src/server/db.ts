import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL || "file:./prisma/dev.db";

// Latest Prisma 7 recommendation: use the adapter factory pattern
const adapter = new PrismaLibSql({ url });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.DEBUG ? ["query", "error"] : ["error"],
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
