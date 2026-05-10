import React from "react";
import { Apple, Smartphone, Search } from "lucide-react";
import { Platform } from "../types";

interface SearchSectionProps {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export function SearchSection({ platform, setPlatform, query, setQuery, onSearch, isLoading }: SearchSectionProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">One Link, All Platforms</h2>
        <p className="text-slate-400 text-lg">Create universal app links that intelligently route users to the iOS App Store or Google Play Store based on their device.</p>
      </section>

      <section className="bg-slate-900/40 border border-slate-800/60 p-1 rounded-2xl">
        <div className="flex p-1 bg-slate-950/50 rounded-xl mb-4">
          <button 
            onClick={() => setPlatform("ios")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${platform === "ios" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Apple className="w-4 h-4" /> App Store
          </button>
          <button 
            onClick={() => setPlatform("android")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${platform === "android" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Smartphone className="w-4 h-4" /> Google Play
          </button>
        </div>

        <div className="flex gap-3 px-3 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder={`Search ${platform === "ios" ? "App Store" : "Google Play"}...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <button 
            onClick={onSearch}
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </section>
    </div>
  );
}
