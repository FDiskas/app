import { prisma } from "./db";
import { StoreService } from "./storeService";
import { ShortLinkStatus } from "@prisma/client";
import type { ShortLink } from "@prisma/client";

const inFlightCleanup = new Map<string, Promise<ShortLink | null>>();

async function checkAvailability(platform: "ios" | "android", id: string) {
  return platform === "ios"
    ? StoreService.isIosAppAvailable(id)
    : StoreService.isAndroidAppAvailable(id);
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
  const inFlight = inFlightCleanup.get(link.id);
  if (inFlight) {
    return inFlight;
  }

  const cleanupTask = performCleanup(link)
    .catch((error) => {
      console.warn(
        `[cleanupShortLink] Failed to clean up link ${link.id}`,
        error,
      );
      return link;
    })
    .finally(() => {
      inFlightCleanup.delete(link.id);
    });

  inFlightCleanup.set(link.id, cleanupTask);

  return cleanupTask;
}
