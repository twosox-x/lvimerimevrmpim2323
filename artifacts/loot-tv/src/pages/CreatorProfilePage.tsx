import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useParams } from "wouter";
import { creators } from "@/data/creators";
import { posts } from "@/data/posts";
import { Lock, Heart, MessageCircle } from "lucide-react";

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username || "0xNeon";
  const creator = creators.find(c => c.username === username) || creators[0];
  const creatorPosts = posts.filter(p => p.creatorId === creator.id);

  const [activeTab, setActiveTab] = useState<"posts" | "vods" | "about">("posts");

  return (
    <AppLayout>
      <div className="pb-12">
        {/* Banner */}
        <div className={`w-full h-48 md:h-64 rounded-2xl ${creator.banner} relative overflow-hidden`}>
           <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Info */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-24">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between mb-8">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-zinc-800 relative z-10">
                <img src={creator.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-white leading-tight">{creator.displayName}</h1>
                <p className="text-zinc-400 font-medium">@{creator.username}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
               <button className="glass-panel hover:bg-white/10 px-6 py-2 rounded-lg font-bold text-white transition-all border border-white/20">
                Subscribe
              </button>
              <button 
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg"
                style={{ backgroundColor: creator.channelColor, boxShadow: `0 0 20px -5px ${creator.channelColor}` }}
              >
                Donate
              </button>
            </div>
          </div>

          <div className="flex gap-6 mb-8 border-b border-white/10 pb-6">
             <div className="flex flex-col">
               <span className="text-2xl font-bold">{creator.subscribers.toLocaleString()}</span>
               <span className="text-zinc-500 text-sm">Subscribers</span>
             </div>
             <div className="flex flex-col">
               <span className="text-2xl font-bold">{creator.category}</span>
               <span className="text-zinc-500 text-sm">Main Category</span>
             </div>
          </div>

          <p className="text-lg text-zinc-300 mb-10 max-w-2xl leading-relaxed">
            {creator.bio}
          </p>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/10 mb-8">
            {(["posts", "vods", "about"] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(56,189,248,1)]" style={{ backgroundColor: creator.channelColor }} />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {activeTab === "posts" && creatorPosts.map(post => (
                <div key={post.id} className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden">
                  {post.isSubscriberOnly ? (
                    <>
                      <div className="blur-md select-none opacity-50">
                        <p className="text-zinc-300 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 z-10">
                         <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/20">
                           <Lock className="w-5 h-5 text-white" />
                         </div>
                         <h4 className="font-bold text-lg mb-2">Subscriber Only</h4>
                         <button className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors">
                           Subscribe to Unlock
                         </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <img src={creator.avatar} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold text-sm">{creator.displayName}</p>
                          <p className="text-xs text-zinc-500">{post.createdAt}</p>
                        </div>
                      </div>
                      <p className="text-zinc-200 mb-4">{post.content}</p>
                      <div className="flex items-center gap-6 text-sm text-zinc-500 border-t border-white/10 pt-4 mt-4">
                        <button className="flex items-center gap-2 hover:text-white transition-colors">
                          <Heart className="w-4 h-4" /> {post.likes}
                        </button>
                        <button className="flex items-center gap-2 hover:text-white transition-colors">
                          <MessageCircle className="w-4 h-4" /> {post.comments}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-xl border border-white/5">
                <h3 className="font-bold mb-4">Top Supporters</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                           #{i}
                         </div>
                         <span className="font-medium text-sm text-zinc-200">User_{Math.floor(Math.random() * 9000)}</span>
                      </div>
                      <span className="text-sm font-bold text-primary" style={{ color: creator.channelColor }}>
                        {(Math.random() * 5).toFixed(1)} ETH
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
