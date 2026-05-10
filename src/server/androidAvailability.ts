export async function isAndroidAppAvailableFromStore(
  store: {
    default?: {
      app?: (options: { appId: string }) => Promise<unknown>;
    };
    app?: (options: { appId: string }) => Promise<unknown>;
  },
  appId: string,
): Promise<boolean> {
  const lookup = store.default?.app ?? store.app;

  if (!lookup) {
    return false;
  }

  try {
    await lookup({ appId });
    return true;
  } catch {
    return false;
  }
}
