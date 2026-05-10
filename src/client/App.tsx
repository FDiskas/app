import React, { useState, useEffect } from "react";
import { orpcUtils } from "./lib/orpc";
import { useMutation } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SearchSection } from "./components/SearchSection";
import { AppList } from "./components/AppList";
import { LinkPreview } from "./components/LinkPreview";
import { History } from "./components/History";
import { Platform, AppResult, HistoryLink } from "./types";

export default function App() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("ios");
  const [results, setResults] = useState<AppResult[]>([]);
  const [selectedIos, setSelectedIos] = useState<AppResult | null>(null);
  const [selectedAndroid, setSelectedAndroid] = useState<AppResult | null>(null);
  const [createdLink, setCreatedLink] = useState<any>(null);
  const [history, setHistory] = useState<HistoryLink[]>([]);
  const [copied, setCopied] = useState(false);

  // Mutations
  const searchMutation = useMutation(orpcUtils.searchStore.mutationOptions({
    onSuccess: (data) => setResults(data as AppResult[]),
  }));

  const getLinkMutation = useMutation(orpcUtils.getLink.mutationOptions({
    onSuccess: (details, variables) => {
      if (details) {
        setSelectedIos(details.iosId ? { id: details.iosId, name: details.iosName!, icon: details.iosIcon!, developer: "" } : null);
        setSelectedAndroid(details.androidId ? { id: details.androidId, name: details.androidName!, icon: details.androidIcon!, developer: "" } : null);
        setCreatedLink(details);
        
        const saved = JSON.parse(localStorage.getItem("applinks") || "[]");
        const idx = saved.findIndex((l: any) => l.slug === variables.slug);
        if (idx !== -1) {
            saved[idx] = { ...saved[idx], iosName: details.iosName, androidName: details.androidName };
            setHistory(saved);
            localStorage.setItem("applinks", JSON.stringify(saved));
        }
      } else {
        // Link not found on server, remove from local history
        const saved = JSON.parse(localStorage.getItem("applinks") || "[]");
        const updated = saved.filter((l: any) => l.slug !== variables.slug);
        setHistory(updated);
        localStorage.setItem("applinks", JSON.stringify(updated));
        alert("This link no longer exists and has been removed from your history.");
      }
    }
  }));

  const syncAppMutation = useMutation(orpcUtils.syncApp.mutationOptions({
    onSuccess: (match, variables) => {
      if (match) {
        const app = match as AppResult;
        if (variables.platform === "ios") setSelectedAndroid(app);
        else setSelectedIos(app);
      }
    }
  }));

  const createLinkMutation = useMutation(orpcUtils.createShortLink.mutationOptions({
    onSuccess: (res) => {
      setCreatedLink(res);
      const newEntry: HistoryLink = { ...res, date: new Date().toISOString() };
      const saved = JSON.parse(localStorage.getItem("applinks") || "[]");
      const filtered = saved.filter((l: any) => l.slug !== res.slug);
      const updated = [newEntry, ...filtered];
      setHistory(updated);
      localStorage.setItem("applinks", JSON.stringify(updated));
    },
    onError: (err) => {
      console.error(err);
      alert("Failed to save link.");
    }
  }));

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("applinks") || "[]");
    setHistory(saved);
  }, []);

  const handleSearch = () => {
    if (!query) return;
    searchMutation.mutate({ query, platform });
  };

  const handleSelect = (app: AppResult) => {
    if (platform === "ios") setSelectedIos(app);
    else setSelectedAndroid(app);
    syncAppMutation.mutate({ name: app.name, platform });
    setResults([]);
  };

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const isLoading = searchMutation.isPending || getLinkMutation.isPending || syncAppMutation.isPending || createLinkMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <SearchSection 
              platform={platform}
              setPlatform={setPlatform}
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
              isLoading={searchMutation.isPending}
            />

            <AppList 
              apps={results}
              onSelect={handleSelect}
            />

            <History 
              history={history}
              onLoad={(link) => getLinkMutation.mutate({ slug: link.slug })}
              onClear={() => { setHistory([]); localStorage.removeItem("applinks"); }}
            />
          </div>

          <div className="lg:col-span-5">
            <LinkPreview 
              selectedIos={selectedIos}
              selectedAndroid={selectedAndroid}
              createdLink={createdLink}
              isLoading={isLoading}
              onGenerate={() => createLinkMutation.mutate({
                iosId: selectedIos?.id,
                iosName: selectedIos?.name,
                iosIcon: selectedIos?.icon,
                androidId: selectedAndroid?.id,
                androidName: selectedAndroid?.name,
                androidIcon: selectedAndroid?.icon,
              })}
              onReset={() => { setCreatedLink(null); setSelectedAndroid(null); setSelectedIos(null); setQuery(""); }}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
