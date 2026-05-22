import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { creators } from "@/data/creators";
import { CreatorCard } from "@/components/shared/CreatorCard";
import { usePageMeta } from "@/lib/page-meta";

const ALL_CATS = ["All", ...Array.from(new Set(creators.map((c) => c.category)))];

export default function CreatorsPage() {
  usePageMeta(
    "Creators Directory | L00T.tv",
    "Find L00T.tv creators by name, username, bio, and streaming category.",
  );
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return creators.filter((c) => {
      const matchesCat = activeCategory === "All" || c.category === activeCategory;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        c.displayName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 sm:gap-6 pb-12 pt-2 sm:pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Creators</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{filtered.length} creators</p>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators"
              className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-[15px] w-full md:w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-1 -mx-3 px-3 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
          {ALL_CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all min-h-10 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_-3px_rgba(56,189,248,0.6)]"
                  : "glass-panel border border-white/5 hover:bg-white/10 text-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {filtered.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No creators found</h3>
            <p className="text-zinc-500 text-sm mb-5">Try a different search term or category.</p>
            <button
              onClick={() => { setQuery(""); setActiveCategory("All"); }}
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
