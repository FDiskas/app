-- CreateTable
CREATE TABLE "ShortLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "androidId" TEXT,
    "androidName" TEXT,
    "androidIcon" TEXT,
    "iosId" TEXT,
    "iosName" TEXT,
    "iosIcon" TEXT,
    "gaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_slug_key" ON "ShortLink"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_androidId_iosId_key" ON "ShortLink"("androidId", "iosId");
