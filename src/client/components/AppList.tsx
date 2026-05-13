import React from "react";
import { AppResult } from "../types";

interface AppListProps {
  apps: AppResult[];
  onSelect: (app: AppResult) => void;
}

export function AppList({ apps, onSelect }: AppListProps) {
  if (apps.length === 0) return null;

  return (
    <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {apps.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => onSelect(app)}
          className="group w-full flex items-center gap-4 p-4 bg-slate-900/20 hover:bg-slate-900/40 border border-slate-800/40 rounded-2xl transition-all text-left"
        >
          <img src={app.icon} alt={app.name} className="w-14 h-14 rounded-xl shadow-md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{app.name}</h3>
            <p className="text-slate-500 text-sm truncate">{app.developer}</p>
          </div>
          <span className="bg-slate-800 group-hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shrink-0">
            Select
          </span>
        </button>
      ))}
    </section>
  );
}
