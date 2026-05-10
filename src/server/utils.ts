export function getRedirectUrl(
  userAgent: string,
  links: { iosId?: string | null; androidId?: string | null },
): string | null {
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  if (isAndroid && links.androidId) {
    return `https://play.google.com/store/apps/details?id=${links.androidId}`;
  }

  if (isIOS && links.iosId) {
    return `https://apps.apple.com/app/id${links.iosId}`;
  }

  return null;
}
