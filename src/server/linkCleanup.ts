import { prisma } from "./db";
import { StoreService } from "./storeService";
import { ShortLinkStatus } from "@prisma/client";
import type { ShortLink } from "@prisma/client";

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_TRACKED_LINKS = 5000;

const lastCleanupAt = new Map<string, number>();
const inFlightCleanup = new Set<string>();

async function checkAvailability(platform: "ios" | "android", id: string) {
  return platform === "ios"
    ? StoreService.isIosAppAvailable(id)
    : StoreService.isAndroidAppAvailable(id);
}

function pruneTrackerIfNeeded() {
  if (lastCleanupAt.size < MAX_TRACKED_LINKS) return;

  const entries = [...lastCleanupAt.entries()];
  entries.sort((a, b) => a[1] - b[1]);

  const toRemove = Math.ceil(MAX_TRACKED_LINKS * 0.2);
  for (let i = 0; i < toRemove; i++) {
    const linkId = entries[i]?.[0];
    if (!linkId) break;
    lastCleanupAt.delete(linkId);
  }
}

function shouldCleanupNow(linkId: string) {
  const now = Date.now();
  const lastRun = lastCleanupAt.get(linkId);

  if (lastRun && now - lastRun < CLEANUP_INTERVAL) {
    return false;
  }

  pruneTrackerIfNeeded();
  lastCleanupAt.set(linkId, now);
  return true;
}

async function scheduleCleanup(linkId: string) {
  if (!shouldCleanupNow(linkId)) return;
  if (inFlightCleanup.has(linkId)) return;

  inFlightCleanup.add(linkId);

  try {
    const link = await prisma.shortLink.findUnique({
      where: { id: linkId },
    });
    if (link) {
      await performCleanup(link);
    }
  } catch {
    // Silently fail for background cleanup
  } finally {
    inFlightCleanup.delete(linkId);
  }
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
  void scheduleCleanup(link.id);

  return link;
}
