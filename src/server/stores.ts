import type { AppResult } from "../shared/types";
import { z } from "zod";
import type { GooglePlaySearchClient } from "./googlePlayTypes";

interface ITunesResult {
  trackId: number;
  trackName: string;
  artworkUrl100: string;
  artistName: string;
  bundleId: string;
}

const itunesResponseSchema = z.object({
  results: z.array(
    z.object({
      trackId: z.number(),
      trackName: z.string(),
      artworkUrl100: z.string(),
      artistName: z.string(),
      bundleId: z.string(),
    }),
  ),
});

const googlePlayResultSchema = z.object({
  appId: z.string(),
  title: z.string(),
  icon: z.string(),
  developer: z.string(),
});

type GooglePlayResult = z.infer<typeof googlePlayResultSchema>;

function mapIosResult(app: ITunesResult): AppResult {
  return {
    id: app.trackId.toString(),
    name: app.trackName,
    icon: app.artworkUrl100,
    developer: app.artistName,
    bundleId: app.bundleId,
  };
}

function mapAndroidResult(app: GooglePlayResult): AppResult {
  return {
    id: app.appId,
    name: app.title,
    icon: app.icon,
    developer: app.developer,
    bundleId: app.appId,
  };
}

export async function searchIos(query: string): Promise<AppResult[]> {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=5`,
  );

  const data = itunesResponseSchema.parse(await response.json());
  return data.results.map(mapIosResult);
}

export async function searchAndroid(
  query: string,
  gplay: GooglePlaySearchClient,
): Promise<AppResult[]> {
  const rawResults = await gplay.search({
    term: query,
    num: 5,
  });

  const results = z.array(googlePlayResultSchema).parse(rawResults);

  return results.map(mapAndroidResult);
}
