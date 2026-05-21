import { AppLayout } from "@/components/layout/AppLayout";
import { streams } from "@/data/streams";
import { categories } from "@/data/categories";
import { StreamCard } from "@/components/shared/StreamCard";
import { Search, Filter } from "lucide-react";

export default function ExplorePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Explore</h1>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search streams..." 
                className="bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <button className="glass-panel p-2 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-sm">
            All Categories
          </button>
          {categories.map(cat => (
            <button key={cat.id} className="whitespace-nowrap px-4 py-1.5 rounded-full glass-panel border border-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {streams.map(stream => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
          {/* Duplicate for mock content filling */}
          {streams.map(stream => (
            <StreamCard key={`${stream.id}_copy`} stream={{...stream, id: `${stream.id}_copy`}} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
