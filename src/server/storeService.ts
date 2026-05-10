import type { AppResult } from "../shared/types";
import {
  searchIos as fetchIosResults,
  searchAndroid as fetchAndroidResults,
} from "./stores";
import { isAndroidAppAvailableFromStore } from "./androidAvailability";

const AVAILABILITY_CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_AVAILABILITY_CACHE_SIZE = 2000;
const EXTERNAL_FETCH_TIMEOUT_MS = 4000;

const availabilityCache = new Map<
  string,
  { value: boolean; expiresAt: number }
>();
type GooglePlayScraper = (typeof import("google-play-scraper"))["default"];
let gplayPromise: Promise<GooglePlayScraper> | null = null;

async function getGooglePlayScraper(): Promise<GooglePlayScraper> {
  if (!gplayPromise) {
    gplayPromise = import("google-play-scraper").then(
      (module) => module.default,
    );
  }

  return gplayPromise;
}

function cacheGet(key: string): boolean | null {
  const entry = availabilityCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    availabilityCache.delete(key);
    return null;
  }

  return entry.value;
}

function cacheSet(key: string, value: boolean) {
  if (availabilityCache.size >= MAX_AVAILABILITY_CACHE_SIZE) {
    const firstKey = availabilityCache.keys().next().value;
    if (firstKey) {
      availabilityCache.delete(firstKey);
    }
  }

  availabilityCache.set(key, {
    value,
    expiresAt: Date.now() + AVAILABILITY_CACHE_TTL_MS,
  });
}

export class StoreService {
  /**
   * Search for apps across iOS or Android stores
   */
  static async search(
    query: string,
    platform: "ios" | "android",
  ): Promise<AppResult[]> {
    if (platform === "ios") {
      return this.searchIos(query);
    } else {
      return this.searchAndroid(query);
    }
  }

  /**
   * Search for an app by name and return the best match
   * Primarily used for cross-platform sync
   */
  static async searchByName(
    appName: string,
    platform: "ios" | "android",
  ): Promise<AppResult | null> {
    const results = await this.search(appName, platform);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Search iOS App Store
   */
  private static async searchIos(query: string): Promise<AppResult[]> {
    return fetchIosResults(query);
  }

  /**
   * Search Google Play Store
   */
  private static async searchAndroid(query: string): Promise<AppResult[]> {
    const gplay = await getGooglePlayScraper();
    return fetchAndroidResults(query, gplay);
  }

  static async isIosAppAvailable(appId: string): Promise<boolean> {
    const cacheKey = `ios:${appId}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}`,
      { signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS) },
    );

    if (!response.ok) {
      cacheSet(cacheKey, false);
      return false;
    }

    const data = (await response.json()) as { resultCount?: number };
    const available = (data.resultCount ?? 0) > 0;
    cacheSet(cacheKey, available);
    return available;
  }

  static async isAndroidAppAvailable(appId: string): Promise<boolean> {
    const cacheKey = `android:${appId}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const gplay = await getGooglePlayScraper();
      const available = await isAndroidAppAvailableFromStore(gplay, appId);
      cacheSet(cacheKey, available);
      return available;
    } catch {
      cacheSet(cacheKey, false);
      return false;
    }
  }
}
