import React from "react";
import { Apple, Smartphone, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { AppResult, CreatedLink } from "../types";
import { PlatformSelector } from "./PlatformSelector";
import { LinkOutput } from "./LinkOutput";

interface LinkPreviewProps {
  link: {
    ios: AppResult | null;
    android: AppResult | null;
    created: CreatedLink | null;
  };
  isLoading: boolean;
  copied: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onCopy: (url: string) => void;
}

export function LinkPreview({
  link,
  isLoading,
  copied,
  onGenerate,
  onReset,
  onCopy,
}: LinkPreviewProps) {
  const { ios: selectedIos, android: selectedAndroid, created: createdLink } =
    link;
  const fullUrl = createdLink ? `${window.location.origin}/${createdLink.slug}` : "";
  const hasSelection = selectedIos || selectedAndroid;

  return (
    <div className="sticky top-12">
      <section className="bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
        <h3 className="text-xl font-bold text-white">Link Preview</h3>
        
        <div className="space-y-4">
          <PlatformSelector
            icon={<Apple className="w-5 h-5" />}
            label="App Store"
            platform="ios"
            app={selectedIos}
          />
          
          <PlatformSelector
            icon={<Smartphone className="w-5 h-5" />}
            label="Google Play"
            platform="android"
            app={selectedAndroid}
          />
        </div>

        {createdLink ? (
          <LinkOutput
            url={fullUrl}
            onCopy={onCopy}
            onReset={onReset}
            copied={copied}
          />
        ) : (
          <button 
            onClick={onGenerate}
            disabled={!hasSelection || isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-violet-600/20"
          >
            {isLoading ? "Saving..." : "Generate Link"}
          </button>
        )}
      </section>
    </div>
  );
}

