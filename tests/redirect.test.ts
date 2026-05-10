import { expect, test, describe } from "bun:test";
import { getRedirectUrl } from "../src/server/utils";

describe("Redirection Logic", () => {
  const links = {
    iosId: "123456789",
    androidId: "com.example.app",
  };

  test("should redirect to App Store on iOS", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";
    const url = getRedirectUrl(ua, links);
    expect(url).toBe("https://apps.apple.com/app/id123456789");
  });

  test("should redirect to Play Store on Android", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36";
    const url = getRedirectUrl(ua, links);
    expect(url).toBe(
      "https://play.google.com/store/apps/details?id=com.example.app",
    );
  });

  test("should return null on Desktop", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    const url = getRedirectUrl(ua, links);
    expect(url).toBe(null);
  });

  test("should return null if ID is missing for platform", () => {
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)";
    const url = getRedirectUrl(ua, { androidId: "com.example" });
    expect(url).toBe(null);
  });
});
