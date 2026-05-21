import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { PlaySquare, PlusSquare, Activity, Users, DollarSign } from "lucide-react";
import { streams } from "@/data/streams";
import { categories } from "@/data/categories";
import { StreamCard } from "@/components/shared/StreamCard";

export default function HomePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-16 pb-12">
        {/* Hero Section */}
        <section className="relative pt-12 lg:pt-24 pb-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Streaming, rebuilt for the <span className="text-primary neon-glow">onchain era.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
              Go live, build a channel, earn crypto donations, and unlock subscriber-only content on L00T.tv.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/explore">
                <div className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-105 transition-all duration-300 cursor-pointer shadow-[0_0_20px_-5px_rgba(56,189,248,0.5)]">
                  <PlaySquare className="w-5 h-5 mr-2" />
                  Watch Live
                </div>
              </Link>
              <a href="#creator-signup">
                <div className="inline-flex items-center justify-center px-6 py-3 rounded-lg glass-panel hover:bg-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer text-white font-medium">
                  <PlusSquare className="w-5 h-5 mr-2" />
                  Become a Creator
                </div>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-16 h-16 text-primary" />
              </div>
              <p className="text-zinc-400 text-sm font-medium mb-1">Active Streams</p>
              <p className="text-3xl font-bold neon-glow">2,841</p>
            </div>
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-primary" />
              </div>
              <p className="text-zinc-400 text-sm font-medium mb-1">Total Viewers</p>
              <p className="text-3xl font-bold neon-glow">142K</p>
            </div>
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-16 h-16 text-primary" />
              </div>
              <p className="text-zinc-400 text-sm font-medium mb-1">Donated Today</p>
              <p className="text-3xl font-bold neon-glow">42.5 ETH</p>
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

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 rounded-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Channel</h3>
              <p className="text-zinc-400 text-sm">Sign up with your wallet, customize your profile, and set your subscription price.</p>
            </div>
            <div className="glass-panel p-8 rounded-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Go Live</h3>
              <p className="text-zinc-400 text-sm">Connect OBS using our secure RTMP ingest. Stream in pristine 4K quality.</p>
            </div>
            <div className="glass-panel p-8 rounded-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Crypto</h3>
              <p className="text-zinc-400 text-sm">Receive instant ETH or L00T donations with zero platform fees.</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map(cat => (
              <Link key={cat.id} href={`/categories`}>
                <div 
                  className="glass-panel-hover p-6 rounded-xl cursor-pointer relative overflow-hidden group min-h-[140px] flex flex-col justify-end"
                  style={{ '--hover-color': cat.accentColor } as any}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                    style={{ backgroundColor: cat.accentColor }}
                  />
                  <div className="relative z-20">
                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-[var(--hover-color)] transition-colors">{cat.name}</h3>
                    <p className="text-xs text-zinc-300 font-medium">{(cat.viewers / 1000).toFixed(1)}K Viewers</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Signup CTA */}
        <section id="creator-signup" className="pt-12 scroll-mt-24">
          <div className="glass-panel p-8 md:p-12 rounded-2xl border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Ready to go live?</h2>
              <p className="text-zinc-400">Join the waitlist for L00T.tv creator access. We're rolling out invites weekly to verified creators.</p>
            </div>
            
            <form className="max-w-xl mx-auto space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Waitlist joined!"); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium ml-1">Display Name</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. NeonGamer" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium ml-1">Username</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. 0xNeon" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium ml-1">Primary Category</label>
                <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none" required>
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium ml-1">ETH Wallet Address</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm" placeholder="0x..." required />
              </div>
              <button type="submit" className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]">
                Join Creator Waitlist
              </button>
            </form>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
