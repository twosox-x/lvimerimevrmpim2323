import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { Settings, Video, Edit3, DollarSign, Users, Copy, AlertTriangle, Eye, EyeOff, Radio, Check, Lock, PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { usePageMeta } from "@/lib/page-meta";

const CATEGORIES = [
  "VALORANT", "League of Legends", "Counter-Strike 2", "Grand Theft Auto V",
  "Minecraft", "Dota 2", "Fortnite", "EVE Online", "World of Warcraft",
  "Apex Legends", "Call of Duty", "EA Sports FC", "PUBG: Battlegrounds",
  "PUBG Mobile", "Overwatch 2", "Rust", "Escape from Tarkov",
  "Rocket League", "Roblox", "Dead by Daylight", "Street Fighter 6",
  "IRL", "Music & Arts", "Esports", "Talk Shows", "Developers", "Fitness", "ASMR",
];
const MOCK_STREAM_KEY = "live_loot_7f3a2b9c_d41e8cd98f00b204e9800998ecf";
const RTMP_URL = "rtmp://ingest.l00t.tv/live";

export default function DashboardPage() {
  usePageMeta(
    "Creator Dashboard | L00T.tv",
    "Manage your L00T.tv channel profile, OBS stream setup, posts, subscriptions, and supporter stats.",
  );
  const { user, isLoggedIn, isCreator, openAuthModal, updateProfile, addCreatorPost, creatorPosts, setStreamLive } = useAuth();

  const [activeTab, setActiveTab] = useState("stream");

  // Stream setup state
  const [streamTitle, setStreamTitle] = useState("Grinding ranked | Drops enabled!");
  const [streamCategory, setStreamCategory] = useState("Games");
  const [isLive, setIsLive] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [streamSaved, setStreamSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [rtmpUrl, setRtmpUrl] = useState(RTMP_URL);
  const [streamKey, setStreamKey] = useState(MOCK_STREAM_KEY);
  const [backendNotice, setBackendNotice] = useState("");

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  // Post state
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<"public" | "subscribers">("public");
  const [postPublished, setPostPublished] = useState(false);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function saveStream() {
    try {
      const result = streamId
        ? await apiRequest<{ stream: { id: string; ingestUrl?: string; streamKey?: string } }>(`/streams/${streamId}`, {
            method: "PATCH",
            body: JSON.stringify({ title: streamTitle, accessType: "public" }),
          })
        : await apiRequest<{ stream: { id: string; ingestUrl?: string; streamKey?: string } }>("/streams", {
            method: "POST",
            body: JSON.stringify({ title: streamTitle, accessType: "public" }),
          });
      setStreamId(result.stream.id);
      if (result.stream.ingestUrl) setRtmpUrl(result.stream.ingestUrl);
      if (result.stream.streamKey) setStreamKey(result.stream.streamKey);
      setBackendNotice("");
    } catch (error) {
      setBackendNotice(error instanceof Error ? error.message : "Backend not available; local preview state saved.");
    } finally {
      setStreamSaved(true);
      setTimeout(() => setStreamSaved(false), 2000);
    }
  }

  async function saveProfile() {
    updateProfile({ displayName, bio });
    await apiRequest("/creators/me", {
      method: "PATCH",
      body: JSON.stringify({ displayName, bio, channelColor: user?.channelColor ?? "#38bdf8" }),
    }).catch(() => undefined);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function publishPost() {
    if (!postContent.trim()) return;
    await apiRequest("/posts", {
      method: "POST",
      body: JSON.stringify({ content: postContent, visibility: postVisibility }),
    }).catch(() => undefined);
    addCreatorPost({
      content: postContent,
      isSubscriberOnly: postVisibility === "subscribers",
    });
    setPostContent("");
    setPostPublished(true);
    setTimeout(() => setPostPublished(false), 2500);
  }

  const tabs = [
    { id: "stream", label: "Stream Setup", icon: Video },
    { id: "profile", label: "Profile", icon: Settings },
    { id: "posts", label: "Posts", icon: Edit3 },
    { id: "monetization", label: "Monetization", icon: DollarSign },
  ];

  // Auth gate — must be a logged-in creator
  if (!isLoggedIn || !isCreator) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-24">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-5">
            <Lock className="w-7 h-7 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Creator Access Required</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-sm">
            {isLoggedIn
              ? "You need a creator account to access the dashboard. Log out and sign up as a creator."
              : "Connect your wallet and create a creator account to access the dashboard."}
          </p>
          <button
            onClick={() => openAuthModal("creator")}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_0_15px_-5px_rgba(56,189,248,0.5)] hover:bg-primary/90 transition-all"
          >
            {isLoggedIn ? "Switch to Creator" : "Join as Creator"}
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pb-12 pt-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Welcome back, <span className="text-primary">{user?.displayName}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/@${user?.username}`}>
              <button className="px-4 py-2 rounded-lg border border-white/10 glass-panel hover:bg-white/5 text-sm font-medium transition-all flex items-center gap-2">
                <Users className="w-4 h-4" />
                My Channel
              </button>
            </Link>
            <button
              onClick={() => {
                const next = !isLive;
                setIsLive(next);
                setStreamLive(next, streamTitle);
                if (streamId) {
                  void apiRequest(`/streams/${streamId}/${next ? "start" : "end"}`, { method: "POST" }).catch(() => undefined);
                }
              }}
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                isLive
                  ? "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                  : "bg-primary text-primary-foreground shadow-[0_0_12px_-3px_rgba(56,189,248,0.6)] hover:bg-primary/90"
              }`}
            >
              <Radio className="w-4 h-4" />
              {isLive ? "End Stream" : "Go Live"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Posts", value: creatorPosts.length },
            { label: "Revenue (mock)", value: "12.5 ETH" },
            { label: "Subscribers", value: "1,420" },
            { label: "Status", value: isLive ? "🔴 LIVE" : "⚫ Offline" },
          ].map((s) => (
            <div key={s.label} className="glass-panel p-4 rounded-xl border border-white/5">
              <p className="text-zinc-500 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.label === "Status" && isLive ? "text-red-400" : "text-white"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Nav */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="glass-panel rounded-xl p-2 border border-white/5 flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all text-left ${
                    activeTab === tab.id ? "bg-primary/20 text-primary border border-primary/30" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 glass-panel rounded-xl border border-white/10 p-6 md:p-8 min-h-[500px]">

            {/* ── STREAM SETUP ── */}
            {activeTab === "stream" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-1">Stream Information</h2>
                  <p className="text-sm text-zinc-400 mb-5">Update your title and category before going live.</p>
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Stream Title</label>
                      <input
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                      <select
                        value={streamCategory}
                        onChange={(e) => setStreamCategory(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none appearance-none"
                      >
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={saveStream}
                      className="flex items-center gap-2 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg hover:bg-primary/90 transition-all"
                    >
                      {streamSaved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Updates"}
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h2 className="text-xl font-bold mb-1">Connection Settings</h2>
                  <p className="text-sm text-zinc-400 mb-5">Use these in OBS or your streaming software.</p>
                  {backendNotice && (
                    <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                      {backendNotice}
                    </div>
                  )}
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">RTMP URL</label>
                      <div className="flex gap-2">
                        <input readOnly value={rtmpUrl} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-zinc-300 font-mono text-sm" />
                        <button onClick={() => copyToClipboard(rtmpUrl, "rtmp")} className="p-2 glass-panel hover:bg-white/10 rounded-lg border border-white/10 flex-shrink-0">
                          {copied === "rtmp" ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-zinc-400">Stream Key</label>
                        <span className="text-red-400 flex items-center gap-1 text-xs"><AlertTriangle className="w-3 h-3" /> Keep secret</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          type={showKey ? "text" : "password"}
                          value={streamKey}
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-zinc-300 font-mono text-sm"
                        />
                        <button onClick={() => setShowKey((v) => !v)} className="p-2 glass-panel hover:bg-white/10 rounded-lg border border-white/10 flex-shrink-0">
                          {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <button onClick={() => copyToClipboard(streamKey, "key")} className="p-2 glass-panel hover:bg-white/10 rounded-lg border border-white/10 flex-shrink-0">
                          {copied === "key" ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILE ── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-1">Profile Settings</h2>
                <p className="text-sm text-zinc-400 mb-5">Changes are saved to your local session.</p>
                <div className="max-w-2xl space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Bio</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell viewers about yourself…"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Wallet Address</label>
                    <input readOnly value={user?.walletAddress ?? ""} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-zinc-500 font-mono text-sm" />
                  </div>
                  <button
                    onClick={saveProfile}
                    className="flex items-center gap-2 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_12px_-3px_rgba(56,189,248,0.4)]"
                  >
                    {profileSaved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Profile"}
                  </button>
                </div>
              </div>
            )}

            {/* ── POSTS ── */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-1">Create Post</h2>
                <div className="glass-panel p-5 rounded-xl border border-white/10 max-w-3xl">
                  <textarea
                    rows={4}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share something with your community…"
                    className="w-full bg-transparent border-none outline-none text-white resize-none placeholder:text-zinc-600 mb-4"
                  />
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <select
                      value={postVisibility}
                      onChange={(e) => setPostVisibility(e.target.value as "public" | "subscribers")}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none"
                    >
                      <option value="public">Public</option>
                      <option value="subscribers">Subscribers Only</option>
                    </select>
                    <button
                      onClick={publishPost}
                      disabled={!postContent.trim()}
                      className="flex items-center gap-2 bg-primary text-primary-foreground font-bold py-1.5 px-6 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-40"
                    >
                      {postPublished ? <><Check className="w-4 h-4" /> Published!</> : <><PlusCircle className="w-4 h-4" /> Publish</>}
                    </button>
                  </div>
                </div>

                {/* Published posts list */}
                {creatorPosts.length > 0 && (
                  <div className="max-w-3xl space-y-4 mt-8">
                    <h3 className="font-bold text-zinc-300">Your Posts ({creatorPosts.length})</h3>
                    {creatorPosts.map((post) => (
                      <div key={post.id} className="glass-panel p-4 rounded-xl border border-white/5 flex justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-sm line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-zinc-600">{post.createdAt}</span>
                            {post.isSubscriberOnly && (
                              <span className="text-xs text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">Subscribers</span>
                            )}
                          </div>
                        </div>
                        <button className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MONETIZATION ── */}
            {activeTab === "monetization" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-1">Monetization</h2>
                <p className="text-sm text-zinc-400 mb-5">Mock revenue overview — connect backend to show real data.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  <div className="glass-panel p-5 rounded-xl border border-white/5">
                    <p className="text-zinc-400 text-xs mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary">12.5 ETH</p>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-white/5">
                    <p className="text-zinc-400 text-xs mb-1">Active Subscribers</p>
                    <p className="text-3xl font-bold">1,420</p>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-white/5">
                    <p className="text-zinc-400 text-xs mb-1">Donations This Month</p>
                    <p className="text-3xl font-bold">3.2 ETH</p>
                  </div>
                </div>
                <div className="max-w-2xl space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">ETH Receive Address</label>
                    <input
                      type="text"
                      defaultValue={user?.walletAddress}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="font-bold mb-3">Subscription Settings</h3>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Monthly Price (ETH)</label>
                    <input type="text" defaultValue="0.01" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-white max-w-xs focus:border-primary outline-none" />
                  </div>
                  <button className="bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-zinc-200 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
