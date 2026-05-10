import { expect, test, describe, mock } from "bun:test";
import { searchIos, searchAndroid } from "../src/server/stores";

// Mocking fetch for iTunes API
globalThis.fetch = mock((url: string) => {
  if (url.includes("itunes.apple.com")) {
    return Promise.resolve(new Response(JSON.stringify({
      results: [{
        trackId: 123,
        trackName: "Mock App",
        artworkUrl100: "icon.png",
        artistName: "Mock Dev",
        bundleId: "com.mock"
      }]
    })));
  }
  return Promise.reject(new Error("Unknown URL"));
}) as any;

describe("Store Search Utilities", () => {
  test("searchIos should return formatted results", async () => {
    const result = await searchIos("test");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Mock App");
    expect(result[0].id).toBe("123");
  });

  test("searchAndroid should return formatted results", async () => {
    const mockGplay = {
      search: mock(() => Promise.resolve([{
        appId: "com.mock",
        title: "Mock Android",
        icon: "icon.png",
        developer: "Mock Dev"
      }]))
    };
    
    const result = await searchAndroid("test", mockGplay);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Mock Android");
    expect(result[0].id).toBe("com.mock");
  });
});
