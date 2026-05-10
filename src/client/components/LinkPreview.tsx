import React from "react";
import { Apple, Smartphone, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { AppResult } from "../types";

interface LinkPreviewProps {
  selectedIos: AppResult | null;
  selectedAndroid: AppResult | null;
  createdLink: any;
  isLoading: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onCopy: (url: string) => void;
  copied: boolean;
}

export function LinkPreview({
  selectedIos,
  selectedAndroid,
  createdLink,
  isLoading,
  onGenerate,
  onReset,
  onCopy,
  copied
}: LinkPreviewProps) {
  const fullUrl = createdLink ? `${window.location.origin}/${createdLink.slug}` : "";

  return (
    <div className="sticky top-12">
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
        <h3 className="text-xl font-bold text-white">Link Preview</h3>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border transition-all ${selectedIos ? "bg-violet-500/5 border-violet-500/20" : "bg-slate-950/50 border-slate-800/50"}`}>
            <div className="flex items-center gap-3 mb-2">
              <Apple className={`w-5 h-5 ${selectedIos ? "text-violet-400" : "text-slate-600"}`} />
              <span className={`text-sm font-bold ${selectedIos ? "text-violet-300" : "text-slate-600"}`}>App Store</span>
            </div>
            {selectedIos ? (
              <div className="flex items-center gap-3">
                <img src={selectedIos.icon} className="w-8 h-8 rounded-md" />
                <span className="text-white font-medium truncate">{selectedIos.name}</span>
              </div>
            ) : (
              <p className="text-slate-700 text-sm">No app selected</p>
            )}
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${selectedAndroid ? "bg-violet-500/5 border-violet-500/20" : "bg-slate-950/50 border-slate-800/50"}`}>
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className={`w-5 h-5 ${selectedAndroid ? "text-violet-400" : "text-slate-600"}`} />
              <span className={`text-sm font-bold ${selectedAndroid ? "text-violet-300" : "text-slate-600"}`}>Google Play</span>
            </div>
            {selectedAndroid ? (
              <div className="flex items-center gap-3">
                <img src={selectedAndroid.icon} className="w-8 h-8 rounded-md" />
                <span className="text-white font-medium truncate">{selectedAndroid.name}</span>
              </div>
            ) : (
              <p className="text-slate-700 text-sm">No app selected</p>
            )}
          </div>
        </div>

        {createdLink ? (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-xl shadow-white/5">
              <QRCodeCanvas 
                value={fullUrl} 
                size={180}
                level="L"
                includeMargin={false}
                fgColor="#020617"
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Your Universal Link</p>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={fullUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-violet-400 font-mono"
                />
                <button 
                  onClick={() => onCopy(fullUrl)}
                  className={`p-3 rounded-xl transition-all ${copied ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
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
        ) : (
          <button 
            onClick={onGenerate}
            disabled={(!selectedIos && !selectedAndroid) || isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-violet-600/20"
          >
            {isLoading ? "Saving..." : "Generate Link"}
          </button>
        )}
      </section>
    </div>
  );
}
