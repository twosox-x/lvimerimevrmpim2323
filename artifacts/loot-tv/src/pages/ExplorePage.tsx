import { useState, useEffect, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { streams } from "@/data/streams";
import { categories } from "@/data/categories";
import { StreamCard } from "@/components/shared/StreamCard";
import { usePageMeta } from "@/lib/page-meta";

function getParam(search: string, key: string): string {
  try {
    return new URLSearchParams(search).get(key) ?? "";
  } catch {
    return "";
  }
}

export default function ExplorePage() {
  usePageMeta(
    "Explore Live Streams | L00T.tv",
    "Search live streams by title, creator, and category, then filter by live status and viewer activity.",
  );
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"viewers" | "recent">("viewers");
  const [liveFilter, setLiveFilter] = useState<"all" | "live" | "offline">("all");

  // Read ?category= from URL on mount / location change
  useEffect(() => {
    const search = window.location.search;
    const cat = getParam(search, "category");
    if (cat) {
      const match = categories.find(
        (c) => c.slug === cat || c.name.toLowerCase() === cat.toLowerCase()
      );
      setActiveCategory(match?.name ?? "All");
    }
  }, [location]);

  // Expand mock content: duplicate streams with unique IDs
  const allStreams = useMemo(() => {
    return [
      ...streams,
      ...streams.map((s) => ({ ...s, id: `${s.id}_b` })),
      ...streams.map((s) => ({ ...s, id: `${s.id}_c` })),
    ];
  }, []);

  const filtered = useMemo(() => {
    let result = allStreams;
    if (activeCategory !== "All") {
      result = result.filter(
        (s) => s.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.creator.displayName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    if (liveFilter === "offline") result = [];
    if (liveFilter === "live") result = result.filter((s) => s.viewers > 0);
    if (sortBy === "viewers") {
      result = [...result].sort((a, b) => b.viewers - a.viewers);
    }
    return result;
  }, [allStreams, activeCategory, query, sortBy, liveFilter]);

  function clearFilters() {
    setQuery("");
    setActiveCategory("All");
    setSortBy("viewers");
    setLiveFilter("all");
  }

  const hasFilters = query || activeCategory !== "All" || liveFilter !== "all";

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 sm:gap-6 pb-12 pt-2 sm:pt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{filtered.length} live streams</p>
          </div>

          <div className="grid grid-cols-2 md:flex md:items-center gap-2.5 md:gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "viewers" | "recent")}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-3 md:py-2 text-sm text-zinc-300 focus:outline-none focus:border-primary transition-all appearance-none min-w-0"
            >
              <option value="viewers">Most Viewers</option>
              <option value="recent">Most Recent</option>
            </select>
            <select
              value={liveFilter}
              onChange={(e) => setLiveFilter(e.target.value as "all" | "live" | "offline")}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-3 md:py-2 text-sm text-zinc-300 focus:outline-none focus:border-primary transition-all appearance-none min-w-0"
            >
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="offline">Offline</option>
            </select>

            {/* Search */}
            <div className="relative group col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search streams, creators…"
                className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-9 py-3 md:py-2 text-[15px] md:text-sm w-full md:w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="col-span-2 md:col-span-1 flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-2.5 md:py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setActiveCategory("All")}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all min-h-10 ${
              activeCategory === "All"
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_-3px_rgba(56,189,248,0.6)]"
                : "glass-panel border border-white/5 hover:bg-white/10"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all min-h-10 ${
                activeCategory === cat.name
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_-3px_rgba(56,189,248,0.6)]"
                  : "glass-panel border border-white/5 hover:bg-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No streams found</h3>
            <p className="text-zinc-500 text-sm mb-5">
              Try a different search or category filter.
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-medium text-sm transition-all"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
