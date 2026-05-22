import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useParams, Link } from "wouter";
import { creators } from "@/data/creators";
import { posts } from "@/data/posts";
import { Lock, Heart, MessageCircle, Star, Gift, Radio } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DonateModal } from "@/components/auth/DonateModal";
import { SubscribeModal } from "@/components/auth/SubscribeModal";
import { usePageMeta } from "@/lib/page-meta";

const TOP_SUPPORTERS = [
  { user: "0xVault", amount: "4.2" },
  { user: "NeonDegen", amount: "2.8" },
  { user: "cryptobro99", amount: "1.5" },
];

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username || "0xNeon";
  const creator = creators.find((c) => c.username === username) || creators[0];
  const creatorPosts = posts.filter((p) => p.creatorId === creator.id);

  usePageMeta(
    `${creator.displayName} (@${creator.username}) | L00T.tv`,
    `View ${creator.displayName}'s L00T.tv channel, posts, live status, supporter options, and ${creator.category} streams.`,
  );

  const { isLoggedIn, openAuthModal, isSubscribedTo } = useAuth();
  const isSubbed = isSubscribedTo(creator.id);

  const [activeTab, setActiveTab] = useState<"posts" | "vods" | "about">("posts");
  const [showDonate, setShowDonate] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  function toggleLike(postId: string) {
    if (!isLoggedIn) { openAuthModal(); return; }
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  }

  return (
    <AppLayout>
      <div className="pb-12">
        {/* Banner */}
        <div className={`w-full h-48 md:h-64 rounded-2xl ${creator.banner} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          {creator.isLive && (
            <Link href={`/stream/${creator.id}`}>
              <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-red-500 transition-colors">
                <Radio className="w-4 h-4" />
                LIVE NOW
              </div>
            </Link>
          )}
        </div>

        {/* Profile Info */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-24">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between mb-8">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-full border-4 overflow-hidden bg-zinc-800 relative z-10" style={{ borderColor: creator.channelColor }}>
                <img src={creator.avatar} className="w-full h-full object-cover" alt={creator.displayName} />
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-white leading-tight">{creator.displayName}</h1>
                <p className="text-zinc-400 font-medium">@{creator.username}</p>
                {isSubbed && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold mt-1 px-2 py-0.5 rounded" style={{ backgroundColor: `${creator.channelColor}20`, color: creator.channelColor }}>
                    <Star className="w-3 h-3" /> Subscribed
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubscribe(true)}
                className="glass-panel hover:bg-white/10 px-5 py-2 rounded-lg font-bold text-white transition-all border border-white/20 flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                {isSubbed ? "Subscribed" : "Subscribe"}
              </button>
              <button
                onClick={() => { if (!isLoggedIn) { openAuthModal("donate"); return; } setShowDonate(true); }}
                className="px-5 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                style={{ backgroundColor: creator.channelColor, color: "#080c14", boxShadow: `0 0 20px -5px ${creator.channelColor}80` }}
              >
                <Gift className="w-4 h-4" />
                Donate
              </button>
            </div>
          </div>

          <div className="flex gap-8 mb-6 border-b border-white/10 pb-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{creator.subscribers.toLocaleString()}</span>
              <span className="text-zinc-500 text-sm">Subscribers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{creator.category}</span>
              <span className="text-zinc-500 text-sm">Category</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{creatorPosts.length}</span>
              <span className="text-zinc-500 text-sm">Posts</span>
            </div>
          </div>

          <p className="text-lg text-zinc-300 mb-8 max-w-2xl leading-relaxed">{creator.bio}</p>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/10 mb-8">
            {(["posts", "vods", "about"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-full" style={{ backgroundColor: creator.channelColor, boxShadow: `0 0 8px ${creator.channelColor}` }} />
                )}
              </button>
            ))}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Posts tab */}
              {activeTab === "posts" && creatorPosts.map((post) => (
                <div key={post.id} className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden">
                  {post.isSubscriberOnly && !isSubbed ? (
                    <>
                      <div className="select-none opacity-30 blur-sm pointer-events-none">
                        <p className="text-zinc-300 mb-4 line-clamp-3">{post.content}</p>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-10">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/20">
                          <Lock className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-lg mb-1">Subscribers Only</h4>
                        <p className="text-zinc-500 text-sm mb-4">Subscribe to unlock this post</p>
                        <button
                          onClick={() => setShowSubscribe(true)}
                          className="font-bold text-sm px-5 py-2 rounded-lg transition-all"
                          style={{ backgroundColor: creator.channelColor, color: "#080c14" }}
                        >
                          Subscribe to Unlock
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {post.isSubscriberOnly && (
                        <div className="flex items-center gap-1.5 text-xs font-bold mb-3 px-2 py-1 rounded w-fit" style={{ backgroundColor: `${creator.channelColor}20`, color: creator.channelColor }}>
                          <Star className="w-3 h-3" /> Subscriber post
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <img src={creator.avatar} className="w-10 h-10 rounded-full" alt={creator.displayName} />
                        <div>
                          <p className="font-bold text-sm">{creator.displayName}</p>
                          <p className="text-xs text-zinc-500">{post.createdAt}</p>
                        </div>
                      </div>
                      <p className="text-zinc-200 mb-4">{post.content}</p>
                      <div className="flex items-center gap-6 text-sm text-zinc-500 border-t border-white/10 pt-4">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-2 transition-colors ${likedPosts.has(post.id) ? "text-red-400" : "hover:text-white"}`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? "fill-red-400" : ""}`} />
                          {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-2 hover:text-white transition-colors">
                          <MessageCircle className="w-4 h-4" /> {post.comments}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* VODs tab */}
              {activeTab === "vods" && (
                <div className="space-y-4">
                  {isSubbed ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 flex gap-4 items-center group cursor-pointer hover:border-white/20 transition-all">
                        <div className="w-32 h-20 rounded-lg bg-zinc-800 flex-shrink-0 flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${creator.channelColor}20, #18181b)` }}>
                          <Radio className="w-6 h-6 text-zinc-600" />
                          <div className="absolute bottom-1 right-1 text-xs bg-black/80 px-1 rounded text-zinc-400">
                            {Math.floor(Math.random() * 3) + 1}:{String(Math.floor(Math.random() * 60)).padStart(2, "0")}h
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-white mb-1 group-hover:text-primary transition-colors">Stream VOD #{i} — {creator.category} highlights</p>
                          <p className="text-xs text-zinc-500">{i} day{i !== 1 ? "s" : ""} ago • {(Math.random() * 5000 + 500).toFixed(0)} views</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-16 text-center">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-zinc-600" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Subscriber VODs</h3>
                      <p className="text-zinc-500 text-sm mb-5">Subscribe to access past streams and exclusive VODs.</p>
                      <button
                        onClick={() => setShowSubscribe(true)}
                        className="font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                        style={{ backgroundColor: creator.channelColor, color: "#080c14" }}
                      >
                        Subscribe to Unlock
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* About tab */}
              {activeTab === "about" && (
                <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                  <h3 className="font-bold text-lg">About {creator.displayName}</h3>
                  <p className="text-zinc-300 leading-relaxed">{creator.bio}</p>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-zinc-500">Category: <span className="text-zinc-300 font-medium">{creator.category}</span></p>
                    <p className="text-sm text-zinc-500 mt-1">Wallet: <span className="font-mono text-zinc-300 text-xs">{creator.id}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {creator.isLive && (
                <Link href={`/stream/${creator.id}`}>
                  <div className="glass-panel p-4 rounded-xl border cursor-pointer hover:border-red-500/50 transition-all" style={{ borderColor: `${creator.channelColor}40` }}>
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                      <Radio className="w-4 h-4" />
                      LIVE NOW
                    </div>
                    <p className="text-sm text-zinc-300">Click to watch the live stream</p>
                  </div>
                </Link>
              )}

              <div className="glass-panel p-5 rounded-xl border border-white/5">
                <h3 className="font-bold mb-4">Top Supporters</h3>
                <div className="space-y-3">
                  {TOP_SUPPORTERS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                          #{i + 1}
                        </div>
                        <span className="font-medium text-sm text-zinc-200">{s.user}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: creator.channelColor }}>{s.amount} ETH</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-3">
                <button
                  onClick={() => setShowSubscribe(true)}
                  className="w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 transition-all"
                >
                  <Star className="w-4 h-4" />
                  {isSubbed ? "Manage Subscription" : "Subscribe"}
                </button>
                <button
                  onClick={() => { if (!isLoggedIn) { openAuthModal("donate"); return; } setShowDonate(true); }}
                  className="w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: creator.channelColor, color: "#080c14" }}
                >
                  <Gift className="w-4 h-4" />
                  Donate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DonateModal
        isOpen={showDonate}
        onClose={() => setShowDonate(false)}
        creatorId={creator.id}
        creatorName={creator.displayName}
        channelColor={creator.channelColor}
      />
      <SubscribeModal
        isOpen={showSubscribe}
        onClose={() => setShowSubscribe(false)}
        creatorId={creator.id}
        creatorName={creator.displayName}
        channelColor={creator.channelColor}
      />
    </AppLayout>
  );
}
