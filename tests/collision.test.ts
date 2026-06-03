import { expect, test, describe, mock, beforeEach } from "bun:test";

type ShortLinkCreateArgs = {
  data: {
    slug: string;
    androidId?: string | null;
    iosId?: string | null;
  };
};

type CreateShortLinkInput = {
  slug?: string;
  androidId?: string;
  iosId?: string;
};

type CreateShortLinkResult = {
  slug: string;
  isExisting: boolean;
};

const mockPrisma = {
  shortLink: {
    findFirst: mock(() => Promise.resolve(null)),
    findUnique: mock(() => Promise.resolve(null)),
    create: mock((data: ShortLinkCreateArgs) =>
      Promise.resolve({
        id: "1",
        slug: data.data.slug,
        androidId: data.data.androidId ?? null,
        iosId: data.data.iosId ?? null,
      }),
    ),
  },
};

const mockNanoid = mock(() => "abc123");

mock.module("../src/server/db", () => ({
  prisma: mockPrisma,
}));

mock.module("nanoid", () => ({
  nanoid: mockNanoid,
}));

const { router } = await import("../src/server/router");
const handler = (
  router as {
    createShortLink: {
      ["~orpc"]: {
        handler: (args: {
          input: CreateShortLinkInput;
        }) => Promise<CreateShortLinkResult>;
      };
    };
  }
).createShortLink["~orpc"].handler;

describe("ShortLink Creation Logic", () => {
  beforeEach(() => {
    mockPrisma.shortLink.findFirst.mockReset();
    mockPrisma.shortLink.findUnique.mockReset();
    mockPrisma.shortLink.create.mockReset();
    mockNanoid.mockReset();

    mockPrisma.shortLink.findFirst.mockImplementation(() =>
      Promise.resolve(null),
    );
    mockPrisma.shortLink.findUnique.mockImplementation(() =>
      Promise.resolve(null),
    );
    mockPrisma.shortLink.create.mockImplementation(
      (data: ShortLinkCreateArgs) =>
        Promise.resolve({
          id: "1",
          slug: data.data.slug,
          androidId: data.data.androidId ?? null,
          iosId: data.data.iosId ?? null,
        }),
    );
    mockNanoid.mockImplementation(() => "abc123");
  });

  test("retries when generated slug collides", async () => {
    mockNanoid
      .mockImplementationOnce(() => "taken1")
      .mockImplementationOnce(() => "fresh1");

    mockPrisma.shortLink.findUnique
      .mockImplementationOnce(() =>
        Promise.resolve({ id: "old", slug: "taken1" }),
      )
      .mockImplementationOnce(() => Promise.resolve(null));

    const result = await handler({ input: { androidId: "com.test" } });

    expect(result.slug).toBe("fresh1");
    expect(mockPrisma.shortLink.findUnique).toHaveBeenCalledTimes(2);
    expect(mockPrisma.shortLink.create).toHaveBeenCalledTimes(1);
  });

  test("throws when custom slug already belongs to another target", async () => {
    mockPrisma.shortLink.findUnique.mockImplementationOnce(() =>
      Promise.resolve({
        id: "existing",
        slug: "custom",
        androidId: "com.other",
        iosId: null,
      }),
    );

    await expect(
      handler({ input: { slug: "custom", androidId: "com.test" } }),
    ).rejects.toThrow("Slug already exists");
    expect(mockPrisma.shortLink.create).toHaveBeenCalledTimes(0);
  });

  test("returns existing when custom slug and target match", async () => {
    mockPrisma.shortLink.findUnique.mockImplementationOnce(() =>
      Promise.resolve({
        id: "existing",
        slug: "custom",
        androidId: "com.test",
        iosId: null,
      }),
    );

    const result = await handler({
      input: { slug: "custom", androidId: "com.test" },
    });

    expect(result.isExisting).toBe(true);
    expect(result.slug).toBe("custom");
    expect(mockPrisma.shortLink.create).toHaveBeenCalledTimes(0);
  });
});
