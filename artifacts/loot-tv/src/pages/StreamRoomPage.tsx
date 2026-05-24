import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { HoneycombBg } from "@/components/layout/HoneycombBg";
import { useParams, Link } from "wouter";
import { streams } from "@/data/streams";
import { chatMessages as initialChat } from "@/data/chat";
import { Users, Play, MessageSquare, Send, Gift, Lock, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DonateModal } from "@/components/auth/DonateModal";
import { SubscribeModal } from "@/components/auth/SubscribeModal";
import { apiRequest, maybeApi, realtimeUrl } from "@/lib/api";
import { usePageMeta } from "@/lib/page-meta";
import { DEFAULT_PROFILE_PICTURE } from "@/data/creators";

// Mock auto-chat messages for simulation
const MOCK_AUTO_CHAT = [
  { user: "0xGhost", text: "Let's go!", type: "normal" },
  { user: "NeonDegen", text: "this stream is insane", type: "subscriber" },
  { user: "cryptoviewer", text: "donated 5 ETH", type: "donation" },
  { user: "Anon_47", text: "PogChamp", type: "normal" },
  { user: "0xLura", text: "first time watching, love it!", type: "normal" },
  { user: "VaultMaster", text: "the alpha is real", type: "subscriber" },
  { user: "degen101", text: "WAGMI", type: "normal" },
  { user: "moonboi", text: "LFG!", type: "normal" },
];

export default function StreamRoomPage() {
  const params = useParams();
  const creatorId = params.id || "c1";
  const stream = streams.find((s) => s.creatorId === creatorId) || streams[0];
  const creator = stream.creator;

  usePageMeta(
    `${stream.title} | L00T.tv`,
    `Watch ${creator.displayName} stream ${stream.category} live on L00T.tv with chat, donations, and subscriptions.`,
  );

  const { isLoggedIn, user, openAuthModal, isSubscribedTo } = useAuth();
  const isSubbed = isSubscribedTo(creator.id);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(initialChat);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showDonate, setShowDonate] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let closed = false;
    void maybeApi<{ messages: Array<{ id: string; message: string; type: string }> }>(
      `/streams/${stream.id}/chat`,
      { messages: [] },
    ).then((history) => {
      if (closed || !history.messages.length) return;
      setMessages(
        history.messages.map((msg) => ({
          id: msg.id,
          user: "viewer",
          text: msg.message,
          type: msg.type,
        })),
      );
    });

    const socket = new WebSocket(realtimeUrl(stream.id));
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type !== "chat.message") return;
      setMessages((prev) => [
        ...prev.slice(-80),
        {
          id: payload.message.id,
          user: payload.message.userId === user?.id ? (user?.displayName ?? "You") : "viewer",
          text: payload.message.message,
          type: payload.message.type,
        },
      ]);
    };
    socket.onerror = () => socket.close();
    return () => {
      closed = true;
      socket.close();
    };
  }, [stream.id, user?.displayName, user?.id]);

  // Mock auto-chat simulation
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      const mock = MOCK_AUTO_CHAT[idx % MOCK_AUTO_CHAT.length];
      setMessages((prev) => [
        ...prev.slice(-80), // cap at 80 messages
        { id: `auto_${Date.now()}_${idx}`, ...mock },
      ]);
      idx++;
    }, 3200 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  function handleSendChat(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!isLoggedIn) {
      openAuthModal("chat");
      return;
    }
    void apiRequest(`/streams/${stream.id}/chat`, {
      method: "POST",
      body: JSON.stringify({ message: chatInput }),
    }).catch(() => undefined);
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        user: user?.displayName ?? "You",
        text: chatInput,
        type: isSubbed ? "subscriber" : "normal",
      },
    ]);
    setChatInput("");
  }

  function handleDonationSent(amount: string, token: string, message: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `d_${Date.now()}`,
        user: user?.displayName ?? "You",
        text: `donated ${amount} ${token}${message ? ` — "${message}"` : ""}`,
        type: "donation",
      },
    ]);
  }

  return (
    <div className="min-h-screen text-foreground">
      <HoneycombBg />
      <Sidebar />
      <div className="md:ml-[68px] h-screen flex overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video Player — full bleed, no rounding */}
          <div className="relative w-full bg-black flex items-center justify-center group" style={{ aspectRatio: '16/9', maxHeight: '65vh' }}>
            <div className="absolute top-4 left-4 z-10 bg-red-500/80 backdrop-blur px-3 py-1 rounded text-white text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse-red" />
              LIVE
            </div>
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              {stream.viewers.toLocaleString()}
            </div>
            {/* TODO_STREAMING: connect RTMP/HLS playback provider */}
            <div className="text-zinc-500 flex flex-col items-center">
              <Play className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-mono text-sm tracking-widest">RTMP/HLS PLAYBACK PLACEHOLDER</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="w-full h-1 bg-white/20 rounded overflow-hidden">
                <div className="w-full h-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="mt-4 px-6 flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex gap-4">
              <Link href={`/creator/${creator.username}`}>
                <img src={creator.avatar || DEFAULT_PROFILE_PICTURE} className="w-16 h-16 rounded-full bg-zinc-800 border-2 cursor-pointer hover:opacity-90 transition-opacity" style={{ borderColor: creator.channelColor }} alt={creator.displayName} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white mb-1">{stream.title}</h1>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <Link href={`/creator/${creator.username}`}>
                    <span className="font-bold hover:underline" style={{ color: creator.channelColor }}>{creator.displayName}</span>
                  </Link>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300 text-xs">{stream.category}</span>
                  {isSubbed && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${creator.channelColor}20`, color: creator.channelColor }}>
                      <Star className="w-3 h-3" />
                      Subscriber
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowSubscribe(true)}
                className="flex-1 md:flex-none glass-panel hover:bg-white/10 px-5 py-2 rounded-lg font-bold text-white transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                {isSubbed ? "Subscribed" : "Subscribe"}
              </button>
              <button
                onClick={() => { if (!isLoggedIn) { openAuthModal("donate"); return; } setShowDonate(true); }}
                className="flex-1 md:flex-none px-5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: creator.channelColor, color: "#080c14", boxShadow: `0 0 15px -5px ${creator.channelColor}80` }}
              >
                <Gift className="w-4 h-4" />
                Donate
              </button>
            </div>
          </div>

          <div className="mx-6 mb-6 mt-4 p-6 glass-panel rounded-xl border border-white/5">
            <h3 className="font-bold text-lg mb-2">About {creator.displayName}</h3>
            <p className="text-zinc-400">{creator.bio}</p>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-[320px] xl:w-[360px] flex-shrink-0 glass-panel flex flex-col h-full border-l border-white/10 overflow-hidden rounded-none">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Live Chat
            </h3>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stream.viewers.toLocaleString()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                {msg.type === "system" ? (
                  <div className="text-zinc-500 text-center text-xs my-1 italic">{msg.text}</div>
                ) : msg.type === "donation" ? (
                  <div className="bg-primary/15 border border-primary/30 p-2 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Gift className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-primary font-bold text-xs">{msg.user}</span>
                    </div>
                    <p className="text-zinc-200 text-xs mt-0.5 pl-5">{msg.text}</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className={`font-bold flex-shrink-0 text-xs ${msg.type === "subscriber" ? "" : "text-zinc-400"}`} style={msg.type === "subscriber" ? { color: creator.channelColor } : {}}>
                      {msg.type === "subscriber" && <Star className="w-2.5 h-2.5 inline mr-0.5 mb-0.5" />}
                      {msg.user}:
                    </span>
                    <span className="text-zinc-200 break-words text-xs">{msg.text}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-white/10 bg-black/40">
            {isLoggedIn ? (
              <form onSubmit={handleSendChat} className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isSubbed ? "★ Send a message…" : "Send a message…"}
                  className="w-full bg-black/60 border border-white/20 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-zinc-600"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => openAuthModal("chat")}
                className="w-full py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 text-zinc-400 hover:text-primary transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Connect wallet to chat
              </button>
            )}
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
        onDonationSent={handleDonationSent}
      />
      <SubscribeModal
        isOpen={showSubscribe}
        onClose={() => setShowSubscribe(false)}
        creatorId={creator.id}
        creatorName={creator.displayName}
        channelColor={creator.channelColor}
        onSubscribed={() => setShowSubscribe(false)}
      />
    </div>
  );
}
