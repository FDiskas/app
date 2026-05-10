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
      bundleId: z.string().optional(),
      platform: z.enum(["ios", "android"]),
    }))
    .handler(async ({ input }) => {
      const targetPlatform = input.platform === "ios" ? "android" : "ios";
      if (targetPlatform === "android") {
        const results = await gplay.search({ term: input.name, num: 1 });
        if (results.length > 0) {
          return {
            id: results[0].appId,
            name: results[0].title,
            icon: results[0].icon,
            developer: results[0].developer,
          };
        }
      } else {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(input.name)}&entity=software&limit=1`);
        const data: any = await response.json();
        if (data.results.length > 0) {
          const app = data.results[0];
          return {
            id: app.trackId.toString(),
            name: app.trackName,
            icon: app.artworkUrl100,
            developer: app.artistName,
          };
        }
      }
      return null;
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
      // Check for existing combination first
      const existing = await prisma.shortLink.findFirst({
        where: {
          androidId: input.androidId || null,
          iosId: input.iosId || null,
        }
      });

      if (existing) {
        return { 
          success: true, 
          slug: existing.slug, 
          iosName: existing.iosName,
          androidName: existing.androidName,
          isExisting: true,
        };
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
        success: true, 
        slug: link.slug, 
        iosName: link.iosName,
        androidName: link.androidName,
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
