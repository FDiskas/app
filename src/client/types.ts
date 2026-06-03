import type { ShortLink } from "../shared/types";
export type { AppResult, Platform } from "../shared/types";

export interface HistoryLink extends Partial<ShortLink> {
  date: string;
  slug: string;
}

export type CreatedLink = ShortLink & { success: boolean; isExisting: boolean };
