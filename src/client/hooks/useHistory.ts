import { useState, useEffect } from "react";
import { HistoryLink, CreatedLink } from "../types";

const STORAGE_KEY = "applinks";

function readStoredHistory(): HistoryLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as HistoryLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[useHistory] Failed to parse stored history", error);
    return [];
  }
}

function writeStoredHistory(history: HistoryLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryLink[]>([]);

  useEffect(() => {
    setHistory(readStoredHistory());
  }, []);

  const saveToHistory = (link: CreatedLink) => {
    const newEntry: HistoryLink = { ...link, date: new Date().toISOString() };
    const saved = readStoredHistory();
    const filtered = saved.filter((l) => l.slug !== link.slug);
    const updated = [newEntry, ...filtered];
    setHistory(updated);
    writeStoredHistory(updated);
  };

  const updateInHistory = (slug: string, updates: Partial<HistoryLink>) => {
    const saved = readStoredHistory();
    const idx = saved.findIndex((l) => l.slug === slug);
    if (idx !== -1) {
      saved[idx] = { ...saved[idx], ...updates };
      setHistory(saved);
      writeStoredHistory(saved);
    }
  };

  const removeFromHistory = (slug: string) => {
    const saved = readStoredHistory();
    const updated = saved.filter((l) => l.slug !== slug);
    setHistory(updated);
    writeStoredHistory(updated);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    history,
    saveToHistory,
    updateInHistory,
    removeFromHistory,
    clearHistory,
  };
}
