import type { ShortLink } from "../../prisma/client";

export interface AppResult {
  id: string;
  name: string;
  icon: string;
  developer: string;
  bundleId?: string;
}

export type Platform = "ios" | "android";

export interface HistoryLink extends Partial<ShortLink> {
  date: string;
  slug: string;
}
