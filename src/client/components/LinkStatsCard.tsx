import React from "react";
import type { HistoryLink } from "../types";

interface LinkStatsCardProps {
  history: HistoryLink[];
}

export function LinkStatsCard({ history }: LinkStatsCardProps) {
  const total = history.length;
  const withBoth = history.filter((link) => link.iosId && link.androidId).length;
  const iosOnly = history.filter((link) => link.iosId && !link.androidId).length;
  const androidOnly = history.filter((link) => !link.iosId && link.androidId).length;

  const stats = [
    { label: "Total Links", value: total },
    { label: "Dual Platform", value: withBoth },
    { label: "iOS Only", value: iosOnly },
    { label: "Android Only", value: androidOnly },
  ];

  return (
    <section className="bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
      <h3 className="text-xl font-bold text-white">Link Stats</h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-300">{stat.value}</p>
          </article>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        Based on your local link history on this device.
      </p>
    </section>
  );
}
