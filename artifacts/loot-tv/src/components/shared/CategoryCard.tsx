import { Link } from "wouter";
import type { Category } from "@/data/categories";

interface CategoryCardProps {
  category: Category;
  /** Larger typography variant — use for hero / featured tiles. */
  featured?: boolean;
  compact?: boolean;
  /** Extra classes for grid placement (e.g. col-span-2 row-span-2). */
  className?: string;
}

/**
 * Standardized category tile used everywhere a category is rendered as a card.
 * Renders gif background when available, falls back to a tinted gradient.
 * Always navigates to `/explore?category=<slug>`.
 */
export function CategoryCard({ category: cat, featured = false, compact = false, className = "" }: CategoryCardProps) {
  return (
    <Link href={`/explore?category=${cat.slug}`}>
      <div
        className={`glass-panel-hover category-card rounded-xl cursor-pointer relative overflow-hidden group flex flex-col justify-end h-full ${compact ? "category-card-compact p-3" : "p-4 sm:p-5 md:p-6"} ${className}`}
        style={{ ["--hover-color" as string]: cat.accentColor } as React.CSSProperties}
        data-testid={`category-card-${cat.slug}`}
      >
        {/* Background: gif/webm or gradient */}
        {cat.gifUrl ? (
          cat.gifUrl.endsWith('.webm') ? (
            <video
              src={cat.gifUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${cat.gifUrl})` }}
            />
          )
        ) : (
          <div
            className="absolute inset-0 opacity-50 transition-transform duration-700 group-hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${cat.accentColor}60, ${cat.accentColor}10)` }}
          />
        )}

        {/* Legibility overlay (lighter to emphasize visuals) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 transition-transform duration-300 group-hover:-translate-y-2">
          <h3 className={`${featured ? "text-xl sm:text-3xl" : "text-sm sm:text-base"} font-bold text-white mb-1 group-hover:text-[var(--hover-color)] transition-colors drop-shadow-lg leading-tight`}>
            {cat.name}
          </h3>
          {!compact && (
            <p className="hidden sm:block text-xs text-zinc-300/80 line-clamp-2 mb-2 max-w-[18rem]">
              {cat.description}
            </p>
          )}
          <div className={`flex items-center gap-2 ${featured ? "text-xs sm:text-sm" : "text-[11px] sm:text-xs"}`}>
            <span className="text-white/80 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-red" />
              {(cat.viewers / 1000).toFixed(1)}K
            </span>
            <span className="text-zinc-500">{cat.liveChannels} live</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
