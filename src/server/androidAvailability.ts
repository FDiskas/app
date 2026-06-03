import type { GooglePlayAvailabilityStore } from "./googlePlayTypes";

export async function isAndroidAppAvailableFromStore(
  store: GooglePlayAvailabilityStore,
  appId: string,
): Promise<boolean> {
  const lookup = store.default?.app ?? store.app;

  if (!lookup) {
    return false;
  }

  try {
    await lookup({ appId });
    return true;
  } catch (error) {
    console.warn(
      `[StoreService] Android availability lookup failed for ${appId}`,
      error,
    );
    return false;
  }
}
