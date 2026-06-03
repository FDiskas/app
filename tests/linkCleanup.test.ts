import { expect, test, describe, mock, beforeEach } from "bun:test";
import { ShortLinkStatus } from "@prisma/client";

type ShortLinkUpdateArgs = {
  where: { id: string };
  data: {
    status?: ShortLinkStatus;
    failCount?: { increment: number };
  };
};

const mockPrisma = {
  shortLink: {
    delete: mock(() => Promise.resolve(null)),
    update: mock((data: ShortLinkUpdateArgs) =>
      Promise.resolve({
        id: data.where.id,
        status: data.data.status,
        failCount: data.data.failCount?.increment ?? 0,
      }),
    ),
  },
};

const mockStoreService = {
  isIosAppAvailable: mock(() => Promise.resolve(true)),
  isAndroidAppAvailable: mock(() => Promise.resolve(true)),
};

mock.module("../src/server/db", () => ({
  prisma: mockPrisma,
}));

mock.module("../src/server/storeService", () => ({
  StoreService: mockStoreService,
}));

const { cleanupShortLink } = await import("../src/server/linkCleanup");

describe("link cleanup", () => {
  beforeEach(() => {
    mockPrisma.shortLink.delete.mockReset();
    mockPrisma.shortLink.update.mockReset();
    mockStoreService.isIosAppAvailable.mockReset();
    mockStoreService.isAndroidAppAvailable.mockReset();

    mockPrisma.shortLink.update.mockImplementation((data: ShortLinkUpdateArgs) =>
      Promise.resolve({
        id: data.where.id,
        status: data.data.status,
        failCount: data.data.failCount?.increment ?? 0,
      }),
    );
    mockStoreService.isIosAppAvailable.mockResolvedValue(true);
    mockStoreService.isAndroidAppAvailable.mockResolvedValue(true);
  });

  test("keeps link when both stores exist", async () => {
    const result = await cleanupShortLink({
      id: "1",
      iosId: "123",
      androidId: "com.example",
      status: ShortLinkStatus.PARTIAL,
      failCount: 2,
    });

    expect(result).toMatchObject({
      status: ShortLinkStatus.ACTIVE,
      failCount: 0,
    });
    expect(mockPrisma.shortLink.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.shortLink.delete).toHaveBeenCalledTimes(0);
  });

  test("keeps link when only one store is missing", async () => {
    mockStoreService.isIosAppAvailable.mockResolvedValue(false);

    const result = await cleanupShortLink({
      id: "1",
      iosId: "123",
      androidId: "com.example",
      status: ShortLinkStatus.ACTIVE,
      failCount: 0,
    });

    expect(result).toMatchObject({ status: ShortLinkStatus.PARTIAL });
    expect(mockPrisma.shortLink.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.shortLink.delete).toHaveBeenCalledTimes(0);
  });

  test("deletes link when both stores are missing", async () => {
    mockStoreService.isIosAppAvailable.mockResolvedValue(false);
    mockStoreService.isAndroidAppAvailable.mockResolvedValue(false);

    const result = await cleanupShortLink({
      id: "1",
      iosId: "123",
      androidId: "com.example",
      status: ShortLinkStatus.ACTIVE,
      failCount: 0,
    });

    expect(result).toBe(null);
    expect(mockPrisma.shortLink.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.shortLink.update).toHaveBeenCalledTimes(0);
  });
});
