import { AppLayout } from "@/components/layout/AppLayout";
import { creators } from "@/data/creators";
import { Link } from "wouter";

export default function CreatorsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12 pt-6">
        <h1 className="text-3xl font-bold">Top Creators</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creators.map(creator => (
            <div key={creator.id} className="glass-panel rounded-xl overflow-hidden border border-white/5 flex flex-col group">
              <div className={`h-24 ${creator.banner} relative`}>
                {creator.isLive && (
                  <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-red" /> LIVE
                  </div>
                )}
              </div>
              <div className="p-4 pt-0 flex flex-col items-center text-center relative flex-1">
                <div 
                  className="w-16 h-16 rounded-full border-4 border-background bg-zinc-800 -mt-8 mb-3 z-10 overflow-hidden transition-transform duration-300 group-hover:scale-110"
                  style={{ borderColor: creator.channelColor || '#18181b' }}
                >
                  <img src={creator.avatar} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg text-white">{creator.displayName}</h3>
                <p className="text-zinc-400 text-sm mb-1">@{creator.username}</p>
                <div className="inline-block px-2 py-1 rounded bg-white/5 text-xs text-zinc-300 mb-3">
                  {creator.category}
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                  {creator.bio}
                </p>
                <div className="mt-auto w-full pt-4 border-t border-white/5">
                  <Link href={`/creator/${creator.username}`}>
                    <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium text-sm transition-colors text-white">
                      View Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
