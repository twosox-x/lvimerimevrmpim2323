import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { PlaySquare, PlusSquare, Activity, Users, DollarSign, LayoutDashboard, LogIn } from "lucide-react";
import { streams } from "@/data/streams";
import { categories } from "@/data/categories";
import { creators } from "@/data/creators";
import { StreamCard } from "@/components/shared/StreamCard";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { CreatorCard } from "@/components/shared/CreatorCard";
import { useAuth } from "@/context/AuthContext";
import { usePageMeta } from "@/lib/page-meta";

export default function HomePage() {
  usePageMeta(
    "L00T.tv | Base-Native Creator Streaming",
    "Go live, discover gaming streams, follow creators, and support channels with Base-native ETH and L00T payments.",
  );
  const { isLoggedIn, isCreator, openAuthModal } = useAuth();
  return (
    <AppLayout>
      <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 pb-12">
        {/* Hero Section */}
        <section className="relative pt-2 sm:pt-6 lg:pt-10 pb-1">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start sm:items-center justify-between w-full overflow-hidden">
            {/* Mobile: mascot leads the hero */}
            <div className="loot-hero-mascot loot-hero-mascot-mobile flex relative items-center justify-center w-full flex-shrink-0 sm:hidden">
              <img
                src="/fwog-base.png"
                alt=""
                aria-hidden="true"
                className="relative z-10 w-full h-full object-contain animate-float drop-shadow-[0_20px_30px_rgba(56,189,248,0.35)]"
              />
            </div>

            {/* Left: copy + CTAs + inline stats */}
            <div className="flex-1 min-w-0 w-full">
              <h1 className="loot-hero-title font-bold tracking-tight mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                The streaming platform <span className="text-primary neon-glow">built for creators.</span>
              </h1>
              <p className="loot-hero-copy text-zinc-400 mb-4 sm:mb-6 max-w-[30rem] leading-relaxed">
                Go live, build your audience, and keep more of what you earn. No corporate middlemen—just the smallest platform cuts in streaming.
              </p>

              <div className="loot-hero-actions gap-2.5 sm:gap-3 mb-5 sm:mb-8 w-full max-w-[24rem] sm:max-w-none">
                <Link href="/explore" className="w-full sm:w-auto">
                  <div className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 sm:py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300 cursor-pointer shadow-[0_0_20px_-5px_rgba(56,189,248,0.5)]">
                    <PlaySquare className="w-4 h-4 mr-2" />
                    Watch Live
                  </div>
                </Link>
                {isLoggedIn && isCreator ? (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <div className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 sm:py-2.5 rounded-lg glass-panel hover:bg-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer text-white font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </div>
                  </Link>
                ) : isLoggedIn ? (
                  <button onClick={() => openAuthModal("creator")} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 sm:py-2.5 rounded-lg glass-panel hover:bg-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer text-white font-medium">
                    <PlusSquare className="w-4 h-4 mr-2" />
                    Become a Creator
                  </button>
                ) : (
                  <button onClick={() => openAuthModal()} className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 sm:py-2.5 rounded-lg glass-panel hover:bg-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer text-white font-medium">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                )}
              </div>

              {/* Compact inline stats strip */}
              <div className="loot-hero-stats gap-2 sm:gap-6 items-stretch sm:items-center w-full max-w-[24rem] sm:max-w-none">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none mb-1">Active</p>
                    <p className="text-lg font-bold leading-none">2,841</p>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none mb-1">Viewers</p>
                    <p className="text-lg font-bold leading-none">142K</p>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none mb-1">Tips</p>
                    <p className="text-lg font-bold leading-none">8,420</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: floating fwog mascot */}
            <div className="loot-hero-mascot loot-hero-mascot-desktop hidden sm:flex relative items-center justify-center flex-shrink-0 -mt-1 sm:mt-0">
              {/* Mascot */}
              <img
                src="/fwog-base.png"
                alt=""
                aria-hidden="true"
                className="relative z-10 w-full h-full object-contain object-right sm:object-center animate-float drop-shadow-[0_20px_30px_rgba(56,189,248,0.35)]"
              />
            </div>
          </div>
        </section>

        {/* Live Now */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-red" />
              Live Now
            </h2>
            <Link href="/explore">
              <span className="text-primary hover:text-primary/80 text-sm font-medium cursor-pointer transition-colors">View All</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {streams.slice(0, 4).map(stream => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </section>

        {/* Recommended For You */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {streams.slice(4, 8).map(stream => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </section>

        {/* Popular Creators */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Popular Creators</h2>
            <Link href="/creators">
              <span className="text-primary hover:text-primary/80 text-sm font-medium cursor-pointer transition-colors">View All</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.slice(0, 4).map(creator => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 border border-primary/30">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-bold mb-1.5">Create Channel</h3>
              <p className="text-zinc-400 text-xs">Sign up with your wallet, customize your profile, and set your subscription price.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 border border-primary/30">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-bold mb-1.5">Go Live</h3>
              <p className="text-zinc-400 text-xs">Connect OBS using our secure RTMP ingest. Stream in pristine 4K quality.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 border border-primary/30">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-bold mb-1.5">Get Paid</h3>
              <p className="text-zinc-400 text-xs">Receive instant tips and subscriptions directly from your community.</p>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Categories</h2>
            <Link href="/categories">
              <span className="text-primary hover:text-primary/80 text-sm font-medium cursor-pointer transition-colors">Explore All</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" style={{ gridAutoRows: 'clamp(180px, 48vw, 364px)' }}>
            {categories.slice(0, 4).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* Creator CTA */}
        <section id="creator-signup" className="pt-8 scroll-mt-24">
          <div className="glass-panel p-6 md:p-10 rounded-2xl border border-primary/20 relative overflow-hidden text-center">
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to go live?</h2>
              <p className="text-zinc-400 mb-6 max-w-lg mx-auto">Start streaming in minutes and maximize your earnings. We take the smallest platform cuts in the industry, so you keep what's yours.</p>
              {isLoggedIn && isCreator ? (
                <Link href="/dashboard">
                  <button className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(56,189,248,0.5)]">
                    <LayoutDashboard className="w-5 h-5" />
                    Open Dashboard
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal(isLoggedIn ? "creator" : undefined)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(56,189,248,0.5)]"
                >
                  <PlusSquare className="w-5 h-5" />
                  {isLoggedIn ? "Upgrade to Creator" : "Get Started — It's Free"}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
