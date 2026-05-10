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

interface SqliteTableInfoRow {
  name: string;
}

export async function ensureShortLinkSchemaCompatibility() {
  const tableInfo = (await prisma.$queryRawUnsafe(
    'PRAGMA table_info("ShortLink")',
  )) as SqliteTableInfoRow[];

  const columnNames = new Set(tableInfo.map((column) => column.name));

  if (!columnNames.has("status")) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "ShortLink" ADD COLUMN "status" TEXT NOT NULL DEFAULT \'ACTIVE\'',
    );
  }

  if (!columnNames.has("failCount")) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "ShortLink" ADD COLUMN "failCount" INTEGER NOT NULL DEFAULT 0',
    );
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "ShortLink" SET "status" = CASE
      WHEN "status" = 'active' THEN 'ACTIVE'
      WHEN "status" = 'partial' THEN 'PARTIAL'
      ELSE "status"
    END`,
  );
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
