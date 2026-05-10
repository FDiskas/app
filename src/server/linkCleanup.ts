import { prisma } from "./db";
import { StoreService } from "./storeService";
import { ShortLinkStatus } from "@prisma/client";
import type { ShortLink } from "@prisma/client";

// Debounce cleanup operations to avoid repeated checks
const cleanupQueue = new Set<string>();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function checkAvailability(platform: "ios" | "android", id: string) {
  return platform === "ios"
    ? StoreService.isIosAppAvailable(id)
    : StoreService.isAndroidAppAvailable(id);
}

function scheduleCleanup(linkId: string) {
  if (cleanupQueue.has(linkId)) return;

  cleanupQueue.add(linkId);

  setTimeout(async () => {
    cleanupQueue.delete(linkId);
    try {
      const link = await prisma.shortLink.findUnique({
        where: { id: linkId },
      });
      if (link) {
        await performCleanup(link);
      }
    } catch {
      // Silently fail for background cleanup
    }
  }, CLEANUP_INTERVAL);
}

async function performCleanup(link: ShortLink) {
  const iosCheck = link.iosId ? checkAvailability("ios", link.iosId) : null;
  const androidCheck = link.androidId
    ? checkAvailability("android", link.androidId)
    : null;

  const [iosAvailable, androidAvailable] = await Promise.all([
    iosCheck,
    androidCheck,
  ]);

  const iosMissing = link.iosId !== null && iosAvailable === false;
  const androidMissing = link.androidId !== null && androidAvailable === false;

  if (iosMissing && androidMissing) {
    await prisma.shortLink.delete({ where: { id: link.id } });
    return null;
  }

  if (iosMissing || androidMissing) {
    return await prisma.shortLink.update({
      where: { id: link.id },
      data: {
        status: ShortLinkStatus.PARTIAL,
        failCount: { increment: 1 },
      },
    });
  }

  if (link.status !== ShortLinkStatus.ACTIVE || link.failCount !== 0) {
    return await prisma.shortLink.update({
      where: { id: link.id },
      data: {
        status: ShortLinkStatus.ACTIVE,
        failCount: 0,
      },
    });
  }

  return link;
}

export async function cleanupShortLink(link: ShortLink) {
  // Schedule cleanup in background instead of awaiting it
  scheduleCleanup(link.id);

  // Return the link immediately without waiting for availability checks
  return link;
}
