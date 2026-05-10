import { os } from "@orpc/server";
import { z } from "zod";
import gplay from "google-play-scraper";
import { prisma } from "./db";
import { nanoid } from "nanoid";
import { searchIos, searchAndroid } from "./stores";

export const router = os.router({
  searchStore: os
    .input(z.object({
      query: z.string(),
      platform: z.enum(["ios", "android"]),
    }))
    .handler(async ({ input }) => {
      if (input.platform === "ios") {
        return await searchIos(input.query);
      } else {
        return await searchAndroid(input.query, gplay);
      }
    }),

  syncApp: os
    .input(z.object({
      name: z.string(),
      platform: z.enum(["ios", "android"]),
    }))
    .handler(async ({ input }) => {
      const targetPlatform = input.platform === "ios" ? "android" : "ios";
      const results = targetPlatform === "android" 
        ? await searchAndroid(input.name, gplay)
        : await searchIos(input.name);
      
      return results.length > 0 ? results[0] : null;
    }),

  createShortLink: os
    .input(z.object({
      slug: z.string().optional(),
      androidId: z.string().optional(),
      androidName: z.string().optional(),
      androidIcon: z.string().optional(),
      iosId: z.string().optional(),
      iosName: z.string().optional(),
      iosIcon: z.string().optional(),
      gaId: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      // Return existing link if IDs match
      if (input.androidId || input.iosId) {
          const existing = await prisma.shortLink.findFirst({
            where: {
              androidId: input.androidId || null,
              iosId: input.iosId || null,
            }
          });

          if (existing) {
            return { 
              ...existing,
              success: true, 
              isExisting: true,
            };
          }
      }

      const slug = input.slug || nanoid(6);

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
