export interface AppResult {
  id: string;
  name: string;
  icon: string;
  developer: string;
  bundleId?: string;
}

export type Platform = "ios" | "android";
