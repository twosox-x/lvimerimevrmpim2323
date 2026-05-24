import { Link } from "wouter";
import { DEFAULT_PROFILE_PICTURE } from "@/data/creators";

export function CreatorCard({ creator }: { creator: any }) {
  return (
    <div className="creator-card glass-panel rounded-xl overflow-hidden border border-white/5 flex flex-col group">
      <div className={`creator-card-banner h-20 sm:h-24 ${creator.banner} relative`}>
        {creator.isLive && (
          <div className="creator-live-badge absolute top-2 right-2 bg-red-500/90 backdrop-blur text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-red" /> LIVE
          </div>
        )}
      </div>
      <div className="creator-card-body p-4 pt-0 flex flex-col items-center text-center relative flex-1">
        <div
          className="creator-card-avatar w-16 h-16 rounded-full border-4 border-background bg-zinc-800 -mt-8 mb-3 z-10 overflow-hidden transition-transform duration-300 group-hover:scale-110"
          style={{ borderColor: creator.channelColor || "#18181b" }}
        >
          <img src={creator.avatar || DEFAULT_PROFILE_PICTURE} className="w-full h-full object-cover" alt={creator.displayName} />
        </div>
        <div className="creator-card-copy min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-white truncate">{creator.displayName}</h3>
          <p className="text-zinc-400 text-xs sm:text-sm mb-1 truncate">@{creator.username}</p>
          <div className="inline-block px-2 py-1 rounded bg-white/5 text-[11px] sm:text-xs text-zinc-300 mb-2 sm:mb-3">{creator.category}</div>
          <p className="creator-card-bio text-xs sm:text-sm text-zinc-500 line-clamp-2 mb-3 sm:mb-4">{creator.bio}</p>
        </div>
        <div className="creator-card-action mt-auto w-full pt-3 sm:pt-4 border-t border-white/5">
          <Link href={`/creator/${creator.username}`}>
            <button className="w-full py-2.5 sm:py-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary font-medium text-sm transition-colors text-white border border-transparent hover:border-primary/30">
              View Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
