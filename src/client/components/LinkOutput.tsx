import React from "react";
import { Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface LinkOutputProps {
  url: string;
  copied: boolean;
  onCopy: (url: string) => void;
  onReset: () => void;
}

export function LinkOutput({ url, copied, onCopy, onReset }: LinkOutputProps) {
  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
      <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-xl shadow-white/5">
        <QRCodeCanvas
          value={url}
          size={180}
          level="L"
          includeMargin={false}
          fgColor="#020617"
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">
          Your Universal Link
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-violet-400 font-mono"
          />
          <button
            onClick={() => onCopy(url)}
            className={`p-3 rounded-xl transition-all ${
              copied
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          onClick={onReset}
          className="w-full text-slate-500 hover:text-slate-300 text-sm font-medium py-2 transition-colors"
        >
          Create Another Link
        </button>
      </div>
    </div>
  );
}
