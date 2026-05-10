import React, { ReactNode } from "react";
import { AppResult } from "../types";

interface PlatformSelectorProps {
  icon: ReactNode;
  label: string;
  platform: "ios" | "android";
  app: AppResult | null;
}

export function PlatformSelector({ icon, label, app }: PlatformSelectorProps) {
  const isSelected = app !== null;
  
  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isSelected
          ? "bg-violet-500/5 border-violet-500/20"
          : "bg-slate-950/50 border-slate-800/50"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-5 h-5 ${
            isSelected ? "text-violet-400" : "text-slate-600"
          }`}
        >
          {icon}
        </div>
        <span
          className={`text-sm font-bold ${
            isSelected ? "text-violet-300" : "text-slate-600"
          }`}
        >
          {label}
        </span>
      </div>
      {app ? (
        <div className="flex items-center gap-3">
          <img src={app.icon} className="w-8 h-8 rounded-md" alt={app.name} />
          <span className="text-white font-medium truncate">{app.name}</span>
        </div>
      ) : (
        <p className="text-slate-700 text-sm">No app selected</p>
      )}
    </div>
  );
}
