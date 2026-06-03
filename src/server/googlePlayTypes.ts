export type GooglePlayScraper = (typeof import("google-play-scraper"))["default"];

export type GooglePlaySearchClient = Pick<GooglePlayScraper, "search">;

export type GooglePlayAvailabilityStore = {
  default?: {
    app?: GooglePlayScraper["app"];
  };
  app?: GooglePlayScraper["app"];
};
