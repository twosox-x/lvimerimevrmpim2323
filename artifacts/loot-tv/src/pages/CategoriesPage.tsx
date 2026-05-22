import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { categories } from "@/data/categories";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { Search, X } from "lucide-react";
import { usePageMeta } from "@/lib/page-meta";

const FILTERS = ["All", "Games", "Topics"] as const;

export default function CategoriesPage() {
  usePageMeta(
    "Gaming Categories | L00T.tv",
    "Browse L00T.tv game and topic categories, including live channel counts, viewer activity, and featured streams.",
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((cat) => {
      const isGame = cat.id.startsWith("g");
      const matchesFilter =
        filter === "All" || (filter === "Games" && isGame) || (filter === "Topics" && !isGame);
      const matchesQuery =
        !q ||
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  function clearFilters() {
    setQuery("");
    setFilter("All");
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 sm:gap-8 pb-12 pt-2 sm:pt-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{filtered.length} live categories</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games and topics"
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto gap-2 pb-1 -mx-3 px-3 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all min-h-10 ${
                  filter === item
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_-3px_rgba(56,189,248,0.6)]"
                    : "glass-panel border border-white/5 hover:bg-white/10 text-zinc-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="categories-mobile-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((cat) => {
            const isFeatured = cat.size === "xl" && filter === "All" && !query;
            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                featured={isFeatured}
                compact={!isFeatured}
                className={isFeatured ? "md:col-span-2 md:row-span-2" : ""}
              />
            );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No categories found</h3>
            <p className="text-zinc-500 text-sm mb-5">Try another game, topic, or filter.</p>
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
