export async function searchIos(query: string) {
  const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=5`);
  const data: any = await response.json();
  return data.results.map((app: any) => ({
    id: app.trackId.toString(),
    name: app.trackName,
    icon: app.artworkUrl100,
    developer: app.artistName,
    bundleId: app.bundleId,
  }));
}

export async function searchAndroid(query: string, gplay: any) {
  const results = await gplay.search({
    term: query,
    num: 5,
  });
  return results.map((app: any) => ({
    id: app.appId,
    name: app.title,
    icon: app.icon,
    developer: app.developer,
    bundleId: app.appId,
  }));
}
