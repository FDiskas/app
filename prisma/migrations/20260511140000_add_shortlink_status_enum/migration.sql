-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShortLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "androidId" TEXT,
    "androidName" TEXT,
    "androidIcon" TEXT,
    "iosId" TEXT,
    "iosName" TEXT,
    "iosIcon" TEXT,
    "gaId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ShortLink" ("androidIcon", "androidId", "androidName", "createdAt", "failCount", "gaId", "id", "iosIcon", "iosId", "iosName", "slug", "status", "updatedAt") SELECT "androidIcon", "androidId", "androidName", "createdAt", "failCount", "gaId", "id", "iosIcon", "iosId", "iosName", "slug", "status", "updatedAt" FROM "ShortLink";
DROP TABLE "ShortLink";
ALTER TABLE "new_ShortLink" RENAME TO "ShortLink";
CREATE UNIQUE INDEX "ShortLink_slug_key" ON "ShortLink"("slug");
CREATE UNIQUE INDEX "ShortLink_androidId_iosId_key" ON "ShortLink"("androidId", "iosId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
