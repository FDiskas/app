import React, { useState, useEffect } from "react";
import { orpc } from "./lib/orpc";
import { QRCodeCanvas } from "qrcode.react";
import { Smartphone, Apple, Search, Sync, Check, Copy, ExternalLink, History, Trash2 } from "lucide-react";

export default function App() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [results, setResults] = useState<any[]>([]);
  const [selectedIos, setSelectedIos] = useState<any>(null);
  const [selectedAndroid, setSelectedAndroid] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Handle secure edit link import
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (path.startsWith("/edit/") && token) {
      const slug = path.split("/")[2];
      const saved = JSON.parse(localStorage.getItem("applinks") || "[]");
      const exists = saved.find((l: any) => l.slug === slug);
      
      if (!exists) {
        // We'll fetch the link details via oRPC in a real scenario
        // For now, let's just save the token so the user can "own" it
        const newEntry = { slug, editToken: token, date: new Date().toISOString(), imported: true };
        const updatedHistory = [newEntry, ...saved];
        setHistory(updatedHistory);
        localStorage.setItem("applinks", JSON.stringify(updatedHistory));
        
        // Clean the URL
        window.history.replaceState({}, document.title, "/");
        
        // Load it into preview
        handleLoadLink(newEntry);
      }
    }

    const saved = JSON.parse(localStorage.getItem("applinks") || "[]");
    setHistory(saved);
  }, []);

  const handleLoadLink = async (link: any) => {
    setLoading(true);
    try {
      const details = await orpc.getLink({ slug: link.slug });
      if (details) {
        // Fetch app details for preview
        if (details.iosId) {
            const res = await orpc.searchStore({ query: details.iosId, platform: "ios" });
            if (res.length > 0) setSelectedIos(res[0]);
        }
        if (details.androidId) {
            const res = await orpc.searchStore({ query: details.androidId, platform: "android" });
            if (res.length > 0) setSelectedAndroid(res[0]);
        }
        setCreatedLink({ ...details, editToken: link.editToken });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await orpc.searchStore({ query, platform });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (app: any, from: "ios" | "android") => {
    setLoading(true);
    try {
      const match = await orpc.syncApp({ name: app.name, platform: from });
      if (match) {
        if (from === "ios") setSelectedAndroid(match);
        else setSelectedIos(match);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (createdLink && createdLink.editToken) {
        // Update existing
        await orpc.updateShortLink({
          slug: createdLink.slug,
          editToken: createdLink.editToken,
          iosId: selectedIos?.id,
          androidId: selectedAndroid?.id,
        });
        alert("Link updated successfully!");
      } else {
        // Create new
        const res = await orpc.createShortLink({
          iosId: selectedIos?.id,
          androidId: selectedAndroid?.id,
        });
        setCreatedLink(res);
        
        const newEntry = { 
          ...res, 
          iosName: selectedIos?.name, 
          androidName: selectedAndroid?.name,
          date: new Date().toISOString()
        };
        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("applinks", JSON.stringify(updatedHistory));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save link.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("applinks");
  };

  const fullUrl = createdLink ? `${window.location.origin}/${createdLink.slug}` : "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Smartphone className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">AppLink</h1>
          </div>
          <button className="text-sm font-medium bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all">
            Login
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Search & Config */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Connect Your Apps</h2>
              <p className="text-slate-400 text-lg">One QR code for both stores. Smart redirection based on device.</p>
            </section>

            <section className="bg-slate-900/40 border border-slate-800/60 p-1 rounded-2xl">
              <div className="flex p-1 bg-slate-950/50 rounded-xl mb-4">
                <button 
                  onClick={() => setPlatform("ios")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${platform === "ios" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Apple className="w-4 h-4" /> App Store
                </button>
                <button 
                  onClick={() => setPlatform("android")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${platform === "android" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Smartphone className="w-4 h-4" /> Google Play
                </button>
              </div>

              <div className="flex gap-3 px-3 pb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={`Search ${platform === "ios" ? "App Store" : "Google Play"}...`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </section>

            {results.length > 0 && (
              <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {results.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-4 bg-slate-900/20 hover:bg-slate-900/40 border border-slate-800/40 rounded-2xl transition-all group">
                    <img src={app.icon} alt={app.name} className="w-14 h-14 rounded-xl shadow-md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{app.name}</h3>
                      <p className="text-slate-500 text-sm truncate">{app.developer}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (platform === "ios") setSelectedIos(app);
                        else setSelectedAndroid(app);
                        handleSync(app, platform);
                        setResults([]);
                      }}
                      className="bg-slate-800 hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all opacity-0 group-hover:opacity-100"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </section>
            )}

            {history.length > 0 && (
              <section className="pt-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <History className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Your Recent Links</h3>
                  </div>
                  <button onClick={clearHistory} className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3 h-3" /> Clear History
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {history.map((link) => (
                    <div key={link.slug} className="flex items-center gap-4 p-4 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-violet-400">{link.slug}</span>
                          <span className="text-[10px] text-slate-600">• {new Date(link.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-300 truncate">
                          {link.iosName || "No iOS"} / {link.androidName || "No Android"}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleLoadLink(link)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Preview & Result */}
          <div className="lg:col-span-5 space-y-8">
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
                          onClick={() => navigator.clipboard.writeText(fullUrl)}
                          className="bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest text-center pt-2">Secure Edit Link (Share to edit elsewhere)</p>
                      <div className="flex gap-2">
                        <input 
                          readOnly 
                          value={`${window.location.origin}/edit/${createdLink.slug}?token=${createdLink.editToken}`}
                          className="flex-1 bg-slate-950/50 border border-slate-800/50 rounded-xl px-4 py-2 text-[10px] text-slate-500 font-mono"
                        />
                        <button 
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/edit/${createdLink.slug}?token=${createdLink.editToken}`)}
                          className="bg-slate-900 p-2 rounded-xl hover:bg-slate-800 transition-all text-slate-600 hover:text-slate-400"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => { setCreatedLink(null); setSelectedAndroid(null); setSelectedIos(null); setQuery(""); }}
                        className="w-full text-slate-500 hover:text-slate-300 text-sm font-medium py-2 transition-colors"
                      >
                        Create Another Link
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleCreate}
                    disabled={(!selectedIos && !selectedAndroid) || loading}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-violet-600/20"
                  >
                    {loading ? "Saving..." : (createdLink && createdLink.editToken ? "Update Link" : "Generate Link")}
                  </button>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
