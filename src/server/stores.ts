export interface AppResult {
  id: string;
  name: string;
  icon: string;
  developer: string;
  bundleId?: string;
}

export async function searchIos(query: string): Promise<AppResult[]> {
  const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=5`);
  const data = await response.json() as { results: any[] };
  return data.results.map((app: any) => ({
    id: app.trackId.toString(),
    name: app.trackName,
    icon: app.artworkUrl100,
    developer: app.artistName,
    bundleId: app.bundleId,
  }));
}

export async function searchAndroid(query: string, gplay: any): Promise<AppResult[]> {
  const results = await gplay.search({
    term: query,
    num: 5,
  }) as any[];
  
  return results.map((app) => ({
    id: app.appId,
    name: app.title,
    icon: app.icon,
    developer: app.developer,
    bundleId: app.appId,
  }));
}
