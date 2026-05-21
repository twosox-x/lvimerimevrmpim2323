import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Settings, Video, Edit3, DollarSign, Users, Copy, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("stream");

  const tabs = [
    { id: "stream", label: "Stream Setup", icon: Video },
    { id: "profile", label: "Profile", icon: Settings },
    { id: "posts", label: "Posts", icon: Edit3 },
    { id: "monetization", label: "Monetization", icon: DollarSign },
  ];

  return (
    <AppLayout>
      <div className="pb-12 pt-6">
        <h1 className="text-3xl font-bold mb-8">Creator Dashboard</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="glass-panel rounded-xl p-2 border border-white/5 flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all text-left
                    ${activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/30' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 glass-panel rounded-xl border border-white/10 p-6 md:p-8 min-h-[600px]">
            {activeTab === "stream" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold mb-2">Stream Information</h2>
                  <p className="text-sm text-zinc-400 mb-6">Update your title and category before going live.</p>
                  
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Stream Title</label>
                      <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue="Grinding ranked | Drops enabled!" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                      <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                        <option>Games</option>
                        <option>IRL</option>
                        <option>Crypto Trading</option>
                      </select>
                    </div>
                    <button className="bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-zinc-200 transition-colors">
                      Save Updates
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h2 className="text-xl font-bold mb-2">Connection Settings</h2>
                  <p className="text-sm text-zinc-400 mb-6">Use these details in OBS or your streaming software.</p>
                  
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">RTMP URL</label>
                      <div className="flex gap-2">
                        <input type="text" readOnly value="rtmp://ingest.l00t.tv/live" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-zinc-300 font-mono text-sm" />
                        <button className="p-2 glass-panel hover:bg-white/10 rounded-lg border border-white/10"><Copy className="w-5 h-5"/></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1 flex justify-between">
                        Stream Key
                        <span className="text-red-400 flex items-center gap-1 text-xs">
                           <AlertTriangle className="w-3 h-3"/> Keep this secret
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <input type="password" readOnly value="live_123456789_abcdefghijklmnopqrstuvwxyz" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-zinc-300 font-mono text-sm" />
                        <button className="p-2 glass-panel hover:bg-white/10 rounded-lg border border-white/10"><Copy className="w-5 h-5"/></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                {/* TODO_BACKEND: persist creator profile */}
                <div className="max-w-2xl space-y-6">
                   <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                      <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2" defaultValue="0xNeon" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Bio</label>
                      <textarea rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 resize-none" defaultValue="Top 100 on the leaderboard. Streaming daily at 8PM EST. Web3 maxi." />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Theme Color</label>
                      <div className="flex gap-4 items-center">
                        <input type="color" defaultValue="#38bdf8" className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                        <span className="text-sm text-zinc-400 font-mono">#38BDF8</span>
                      </div>
                   </div>
                   <button className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors shadow-lg">
                      Save Profile
                    </button>
                </div>
              </div>
            )}

            {activeTab === "monetization" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-6">Monetization</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="glass-panel p-6 rounded-xl border border-white/5">
                     <p className="text-zinc-400 text-sm mb-1">Total Revenue</p>
                     <p className="text-3xl font-bold text-primary">12.5 ETH</p>
                   </div>
                   <div className="glass-panel p-6 rounded-xl border border-white/5">
                     <p className="text-zinc-400 text-sm mb-1">Active Subscribers</p>
                     <p className="text-3xl font-bold">1,420</p>
                   </div>
                </div>

                <div className="max-w-2xl space-y-6">
                   <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">ETH Receive Address</label>
                      <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm" defaultValue="0x71C...976F" />
                   </div>
                   <div className="pt-4 border-t border-white/10">
                      <h3 className="font-bold mb-4">Subscription Settings</h3>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Monthly Price (ETH)</label>
                      <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono" defaultValue="0.01" />
                   </div>
                   <button className="bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-zinc-200 transition-colors">
                      Save Settings
                    </button>
                </div>
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-6">Create Post</h2>
                <div className="glass-panel p-4 rounded-xl border border-white/10 max-w-3xl">
                  <textarea 
                    rows={3} 
                    placeholder="What's on your mind?"
                    className="w-full bg-transparent border-none outline-none text-white resize-none mb-4"
                  />
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                     <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none">
                       <option>Public</option>
                       <option>Subscribers Only</option>
                     </select>
                     <button className="bg-primary text-primary-foreground font-bold py-1.5 px-6 rounded-lg hover:bg-primary/90 transition-colors shadow-lg">
                       Publish
                     </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
