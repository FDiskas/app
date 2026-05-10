import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpcUtils } from "../lib/orpc";
import { AppResult, Platform } from "../types";

const DEBOUNCE_DELAY = 300; // ms

export function useAppSearch() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("ios");
  const [results, setResults] = useState<AppResult[]>([]);
  const [selectedIos, setSelectedIos] = useState<AppResult | null>(null);
  const [selectedAndroid, setSelectedAndroid] = useState<AppResult | null>(
    null,
  );
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchMutation = useMutation(
    orpcUtils.searchStore.mutationOptions({
      onSuccess: (data) => setResults(data),
    }),
  );

  const syncAppMutation = useMutation(
    orpcUtils.syncApp.mutationOptions({
      onSuccess: (app) => {
        if (app) {
          if (platform === "ios") setSelectedAndroid(app);
          else setSelectedIos(app);
        }
      },
    }),
  );

  const handleSearch = () => {
    if (!query) return;
    searchMutation.mutate({ query, platform });
  };

  const handleSelect = useCallback(
    (app: AppResult) => {
      if (platform === "ios") {
        setSelectedIos(app);
      } else {
        setSelectedAndroid(app);
      }

      const counterpart = platform === "ios" ? selectedAndroid : selectedIos;

      // Skip sync if the counterpart already appears to match the selected app.
      if (counterpart?.name && counterpart.name === app.name) {
        setResults([]);
        return;
      }

      const targetPlatform = platform === "ios" ? "android" : "ios";

      // Debounce sync to prevent rapid repeated searches
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncAppMutation.mutate({ name: app.name, platform: targetPlatform });
      }, DEBOUNCE_DELAY);

      setResults([]);
    },
    [platform, selectedAndroid, selectedIos, syncAppMutation],
  );

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const setSelectedApps = (
    iosApp: AppResult | null,
    androidApp: AppResult | null,
  ) => {
    setSelectedIos(iosApp);
    setSelectedAndroid(androidApp);
  };

  const clearSelection = () => {
    setSelectedIos(null);
    setSelectedAndroid(null);
    setQuery("");
    setResults([]);
  };

  return {
    query,
    setQuery,
    platform,
    setPlatform,
    results,
    selectedIos,
    selectedAndroid,
    setSelectedApps,
    isSearching: searchMutation.isPending || syncAppMutation.isPending,
    handleSearch,
    handleSelect,
    clearSelection,
  };
}
