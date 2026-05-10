import { expect, test, describe, mock } from "bun:test";
import { isAndroidAppAvailableFromStore } from "../src/server/androidAvailability";

describe("isAndroidAppAvailableFromStore", () => {
  test("returns true when the Play Store lookup succeeds", async () => {
    const app = mock(() => Promise.resolve({}));

    const result = await isAndroidAppAvailableFromStore(
      { app },
      "com.example.app",
    );

    expect(result).toBe(true);
    expect(app).toHaveBeenCalledTimes(1);
    expect(app).toHaveBeenCalledWith({ appId: "com.example.app" });
  });

  test("falls back to the direct lookup when the default export has no app method", async () => {
    const app = mock(() => Promise.resolve({}));

    const result = await isAndroidAppAvailableFromStore(
      { default: {}, app },
      "com.example.app",
    );

    expect(result).toBe(true);
    expect(app).toHaveBeenCalledTimes(1);
    expect(app).toHaveBeenCalledWith({ appId: "com.example.app" });
  });

  test("returns false when the lookup method is unavailable", async () => {
    const result = await isAndroidAppAvailableFromStore({}, "com.example.app");

    expect(result).toBe(false);
  });

  test("returns false when the lookup throws", async () => {
    const app = mock(() => {
      throw new Error("Not found");
    });

    const result = await isAndroidAppAvailableFromStore(
      { app },
      "com.example.app",
    );

    expect(result).toBe(false);
  });
});
