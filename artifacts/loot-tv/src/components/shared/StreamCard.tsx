import { Link } from "wouter";
import { User, Eye } from "lucide-react";
import { DEFAULT_PROFILE_PICTURE } from "@/data/creators";

export function StreamCard({ stream }: { stream: any }) {
  return (
    <Link href={`/stream/${stream.creatorId}`}>
      <div className="group cursor-pointer flex flex-col gap-3" data-testid={`stream-card-${stream.id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden glass-panel-hover border border-white/5">
          <img 
            src={stream.thumbnail} 
            alt={stream.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
          />
          <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-red"></span>
            LIVE
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            {(stream.viewers / 1000).toFixed(1)}K
          </div>
        </div>
        
        <div className="flex gap-3 px-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all">
              <img src={stream.creator.avatar || DEFAULT_PROFILE_PICTURE} alt={stream.creator.displayName} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{stream.title}</h3>
            <p className="text-zinc-400 text-sm truncate">{stream.creator.displayName}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{stream.category}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
