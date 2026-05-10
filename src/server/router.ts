import { os } from "@orpc/server";
import { z } from "zod";
import gplay from "google-play-scraper";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { searchIos, searchAndroid } from "./stores";

const prisma = new PrismaClient();

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
      iosId: z.string().optional(),
      gaId: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const slug = input.slug || nanoid(6);
      const editToken = nanoid(12);

      const link = await prisma.shortLink.create({
        data: {
          slug,
          androidId: input.androidId,
          iosId: input.iosId,
          gaId: input.gaId,
          editToken,
        },
      });

      return { 
        success: true, 
        slug: link.slug, 
        editToken: link.editToken 
      };
    }),

  getLink: os
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      return await prisma.shortLink.findUnique({
        where: { slug: input.slug },
      });
    }),
  updateShortLink: os
    .input(z.object({
      slug: z.string(),
      editToken: z.string(),
      androidId: z.string().optional(),
      iosId: z.string().optional(),
      gaId: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const link = await prisma.shortLink.findUnique({
        where: { slug: input.slug },
      });

      if (!link || link.editToken !== input.editToken) {
        throw new Error("Unauthorized");
      }

      const updated = await prisma.shortLink.update({
        where: { slug: input.slug },
        data: {
          androidId: input.androidId,
          iosId: input.iosId,
          gaId: input.gaId,
        },
      });

      return { success: true, slug: updated.slug };
    }),
});

export type AppRouter = typeof router;
