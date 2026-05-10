import React from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Disclaimer } from "./components/Disclaimer";
import { SearchSection } from "./components/SearchSection";
import { AppList } from "./components/AppList";
import { LinkPreview } from "./components/LinkPreview";
import { History } from "./components/History";
import { useAppSearch } from "./hooks/useAppSearch";
import { useLinkGeneration } from "./hooks/useLinkGeneration";
import { useLinkRetrieval } from "./hooks/useLinkRetrieval";
import { useClipboard } from "./hooks/useClipboard";
import { useHistory } from "./hooks/useHistory";
import { CreatedLink, HistoryLink } from "./types";

export default function App() {
  const {
    query,
    setQuery,
    platform,
    setPlatform,
    results,
    selectedIos,
    selectedAndroid,
    setSelectedApps,
    isSearching,
    handleSearch,
    handleSelect,
    clearSelection,
  } = useAppSearch();
  const { history, clearHistory, saveToHistory } = useHistory();
  const { createdLink, isGenerating, generateLink, resetLink, showCreatedLink } = useLinkGeneration({
    saveToHistory,
  });
  const { isRetrieving, retrieveLink } = useLinkRetrieval({
    onSuccess: (ios, android) => {
      setSelectedApps(ios, android);
    },
    onMissing: () => {
      resetLink();
    },
  });
  const { copiedText, copy } = useClipboard();

  const isLoading = isSearching || isGenerating || isRetrieving;

  const clearGeneratedPreview = () => {
    if (createdLink) {
      resetLink();
    }
  };

  const handleQueryChange = (value: string) => {
    clearGeneratedPreview();
    setQuery(value);
  };

  const handlePlatformChange = (value: typeof platform) => {
    clearGeneratedPreview();
    setPlatform(value);
  };

  const handleAppSelection = (app: Parameters<typeof handleSelect>[0]) => {
    clearGeneratedPreview();
    handleSelect(app);
  };

  const handleSearchRequest = () => {
    clearGeneratedPreview();
    handleSearch();
  };

  const handleReset = () => {
    resetLink();
    clearSelection();
    setQuery("");
  };

  const toCreatedLink = (link: HistoryLink): CreatedLink => {
    const createdAt = new Date(link.createdAt ?? link.date);
    const updatedAt = new Date(link.updatedAt ?? createdAt);

    return {
      id: link.id ?? link.slug,
      slug: link.slug,
      androidId: link.androidId ?? null,
      androidName: link.androidName ?? null,
      androidIcon: link.androidIcon ?? null,
      iosId: link.iosId ?? null,
      iosName: link.iosName ?? null,
      iosIcon: link.iosIcon ?? null,
      gaId: link.gaId ?? null,
      createdAt,
      updatedAt,
      success: true,
      isExisting: true,
    };
  };

  const handleHistoryLoad = (link: HistoryLink) => {
    showCreatedLink(toCreatedLink(link));
    retrieveLink(link.slug);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <SearchSection 
              platform={platform}
              setPlatform={handlePlatformChange}
              query={query}
              setQuery={handleQueryChange}
              onSearch={handleSearchRequest}
              isLoading={isSearching}
            />

            <AppList 
              apps={results}
              onSelect={handleAppSelection}
            />

            <History 
              history={history}
              onLoad={handleHistoryLoad}
              onClear={clearHistory}
              onCopy={copy}
              copiedUrl={copiedText}
            />
          </div>

          <div className="lg:col-span-5">
            <LinkPreview 
              link={{
                ios: selectedIos,
                android: selectedAndroid,
                created: createdLink,
              }}
              isLoading={isLoading}
              copiedUrl={copiedText}
              onGenerate={() => generateLink(selectedIos, selectedAndroid)}
              onReset={handleReset}
              onCopy={copy}
            />
          </div>
        </main>
        
        <Disclaimer />
        <Footer />
      </div>
    </div>
  );
}

