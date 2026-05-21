import { AppLayout } from "@/components/layout/AppLayout";
import { categories } from "@/data/categories";

export default function CategoriesPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12 pt-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[160px]">
          {categories.map((cat, i) => {
            // Make Games taking up 2x2, others standard
            const isLarge = cat.size === 'xl' || cat.id === '1';
            
            return (
              <div 
                key={cat.id}
                className={`glass-panel-hover rounded-xl cursor-pointer relative overflow-hidden group flex flex-col justify-end p-6 ${isLarge ? 'col-span-2 row-span-2' : ''}`}
                style={{ '--hover-color': cat.accentColor } as any}
              >
                {/* Fallback animated gradient background if no GIF */}
                <div 
                  className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(45deg, ${cat.accentColor}40, transparent)`,
                    ...(cat.gifUrl ? { backgroundImage: `url(${cat.gifUrl})`, backgroundSize: 'cover' } : {})
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-bold text-white mb-2 group-hover:text-[var(--hover-color)] transition-colors drop-shadow-lg`}>
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-red" />
                      {(cat.viewers / 1000).toFixed(1)}K Viewers
                    </span>
                    <span className="text-zinc-400">{cat.liveChannels} Channels</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
