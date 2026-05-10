import type { AppResult } from "../shared/types";

interface ITunesResult {
  trackId: number;
  trackName: string;
  artworkUrl100: string;
  artistName: string;
  bundleId: string;
}

interface ITunesResponse {
  results: ITunesResult[];
}

interface GooglePlayResult {
  appId: string;
  title: string;
  icon: string;
  developer: string;
}

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
  const data = (await response.json()) as ITunesResponse;
  return data.results.map(mapIosResult);
}

export async function searchAndroid(
  query: string,
  gplay: {
    search: (options: { term: string; num: number }) => Promise<unknown>;
  },
): Promise<AppResult[]> {
  const results = (await gplay.search({
    term: query,
    num: 5,
  })) as GooglePlayResult[];

  return results.map(mapAndroidResult);
}
