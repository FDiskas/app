import type { AppResult } from "../shared/types";
import gplay from "google-play-scraper";
import {
  searchIos as fetchIosResults,
  searchAndroid as fetchAndroidResults,
} from "./stores";

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
    return fetchAndroidResults(query, gplay);
  }
}
