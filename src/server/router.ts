import { os } from "@orpc/server";
import { z } from "zod";
import { prisma } from "./db";
import { nanoid } from "nanoid";
import { StoreService } from "./storeService";

const MAX_GENERATED_SLUG_ATTEMPTS = 5;

function sameTarget(
  existing: { androidId: string | null; iosId: string | null },
  input: { androidId?: string; iosId?: string },
) {
  return (
    existing.androidId === (input.androidId ?? null) &&
    existing.iosId === (input.iosId ?? null)
  );
}

export const router = os.router({
  searchStore: os
    .input(
      z.object({
        query: z.string(),
        platform: z.enum(["ios", "android"]),
      }),
    )
    .handler(async ({ input }) => {
      return await StoreService.search(input.query, input.platform);
    }),

  syncApp: os
    .input(
      z.object({
        name: z.string(),
        platform: z.enum(["ios", "android"]),
      }),
    )
    .handler(async ({ input }) => {
      const appName = input.name.trim();
      if (!appName) return null;

      const targetPlatform = input.platform === "ios" ? "android" : "ios";
      return await StoreService.searchByName(appName, targetPlatform);
    }),

  createShortLink: os
    .input(
      z.object({
        slug: z.string().optional(),
        androidId: z.string().optional(),
        androidName: z.string().optional(),
        androidIcon: z.string().optional(),
        iosId: z.string().optional(),
        iosName: z.string().optional(),
        iosIcon: z.string().optional(),
        gaId: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      // Return existing link if IDs match
      if (input.androidId || input.iosId) {
        const existing = await prisma.shortLink.findFirst({
          where: {
            androidId: input.androidId || null,
            iosId: input.iosId || null,
          },
        });

        if (existing) {
          return {
            ...existing,
            success: true,
            isExisting: true,
          };
        }
      }

      const requestedSlug = input.slug?.trim();

      if (requestedSlug) {
        const existingBySlug = await prisma.shortLink.findUnique({
          where: { slug: requestedSlug },
        });

        if (existingBySlug) {
          if (sameTarget(existingBySlug, input)) {
            return {
              ...existingBySlug,
              success: true,
              isExisting: true,
            };
          }

          throw new Error("Slug already exists. Please choose another slug.");
        }
      }

      let slug = requestedSlug;

      if (!slug) {
        // Handle potential collisions for generated slugs
        let attempts = 0;
        while (attempts < MAX_GENERATED_SLUG_ATTEMPTS) {
          const candidate = nanoid(6);
          const collision = await prisma.shortLink.findUnique({
            where: { slug: candidate },
          });
          if (!collision) {
            slug = candidate;
            break;
          }
          attempts++;
        }
      }

      if (!slug) {
        throw new Error(
          "Failed to generate a unique slug after multiple attempts.",
        );
      }

      const link = await prisma.shortLink.create({
        data: {
          slug,
          androidId: input.androidId,
          androidName: input.androidName,
          androidIcon: input.androidIcon,
          iosId: input.iosId,
          iosName: input.iosName,
          iosIcon: input.iosIcon,
          gaId: input.gaId,
        },
      });

      return {
        ...link,
        success: true,
        isExisting: false,
      };
    }),

  getLink: os
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      return await prisma.shortLink.findUnique({
        where: { slug: input.slug },
      });
    }),
});

export type AppRouter = typeof router;
