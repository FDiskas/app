import React from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SearchSection } from "./components/SearchSection";
import { AppList } from "./components/AppList";
import { LinkPreview } from "./components/LinkPreview";
import { History } from "./components/History";
import { useAppSearch } from "./hooks/useAppSearch";
import { useLinkGeneration } from "./hooks/useLinkGeneration";
import { useLinkRetrieval } from "./hooks/useLinkRetrieval";
import { useClipboard } from "./hooks/useClipboard";
import { useHistory } from "./hooks/useHistory";

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
  const { createdLink, isGenerating, generateLink, resetLink } = useLinkGeneration();
  const { isRetrieving, retrieveLink } = useLinkRetrieval({
    onSuccess: (ios, android) => {
      setSelectedApps(ios, android);
    }
  });
  const { copied, copy } = useClipboard();
  const { history, clearHistory } = useHistory();

  const isLoading = isSearching || isGenerating || isRetrieving;

  const handleReset = () => {
    resetLink();
    clearSelection();
    setQuery("");
  };

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
              isLoading={isSearching}
            />

            <AppList 
              apps={results}
              onSelect={handleSelect}
            />

            <History 
              history={history}
              onLoad={(link) => retrieveLink(link.slug)}
              onClear={clearHistory}
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
              copied={copied}
              onGenerate={() => generateLink(selectedIos, selectedAndroid)}
              onReset={handleReset}
              onCopy={copy}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

