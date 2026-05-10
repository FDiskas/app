import React from "react";
import { History as HistoryIcon, Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { HistoryLink } from "../types";

interface HistoryProps {
  history: HistoryLink[];
  onLoad: (link: HistoryLink) => void;
  onClear: () => void;
  onCopy: (url: string) => void;
  copiedUrl?: string | null;
}

export function History({ history, onLoad, onClear, onCopy, copiedUrl }: HistoryProps) {
  if (history.length === 0) return null;

  return (
    <section className="pt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-slate-400">
          <HistoryIcon className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Your Recent Links</h3>
        </div>
        <button onClick={onClear} className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors">
          <Trash2 className="w-3 h-3" /> Clear History
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {history.map((link) => {
          const url = `${window.location.origin}/${link.slug}`;
          const isCopied = copiedUrl === url;

          return (
          <div key={link.slug} className="flex items-center gap-4 p-4 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-violet-400">{link.slug}</span>
                <span className="text-[10px] text-slate-600">• {new Date(link.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-300 truncate">
                {link.iosName || "No iOS"} / {link.androidName || "No Android"}
              </p>
              <button
                type="button"
                onClick={() => onCopy(url)}
                className="block max-w-full truncate text-left text-xs font-mono text-slate-500 hover:text-violet-300 transition-colors"
                title={url}
              >
                {url}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => onCopy(url)}
                className={`p-2 rounded-lg transition-colors ${
                  isCopied
                    ? "bg-green-500/20 text-green-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
                aria-label={`Copy ${link.slug}`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button 
                type="button"
                onClick={() => onLoad(link)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label={`Load ${link.slug}`}
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )})}
      </div>
    </section>
  );
}
