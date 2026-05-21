import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useParams } from "wouter";
import { creators } from "@/data/creators";
import { streams } from "@/data/streams";
import { chatMessages as initialChat } from "@/data/chat";
import { supporters } from "@/data/supporters";
import { Users, User, Play, MessageSquare, DollarSign, Send, Gift, X, Check } from "lucide-react";

export default function StreamRoomPage() {
  const params = useParams();
  const creatorId = params.id || "c1";
  const stream = streams.find(s => s.creatorId === creatorId) || streams[0];
  const creator = stream.creator;

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(initialChat);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showDonate, setShowDonate] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [donateAmount, setDonateAmount] = useState("10");
  const [donateToken, setDonateToken] = useState("L00T");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // TODO_CHAT: replace mock chat with realtime backend
    setMessages([...messages, {
      id: `m_${Date.now()}`,
      user: "You",
      text: chatInput,
      type: "normal"
    }]);
    setChatInput("");
  };

  const handleDonate = () => {
    // TODO_PAYMENTS: send ETH donation on Base / call L00T ERC-20 transfer
    alert(`Donated ${donateAmount} ${donateToken}!`);
    setShowDonate(false);
  };

  const handleSubscribe = () => {
    // TODO_SUBSCRIPTIONS: verify payment and create 30-day access pass
    alert("Subscribed for 30 days!");
    setShowSubscribe(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2 custom-scrollbar">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group">
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

            {/* Mock Player Controls */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="w-full h-1 bg-white/20 rounded overflow-hidden">
                <div className="w-full h-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="mt-6 flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex gap-4">
              <img src={creator.avatar} className="w-16 h-16 rounded-full bg-zinc-800 border-2" style={{ borderColor: creator.channelColor }} />
              <div>
                <h1 className="text-xl font-bold text-white mb-1">{stream.title}</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-primary">{creator.displayName}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300 text-xs">{stream.category}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowSubscribe(true)}
                className="flex-1 md:flex-none glass-panel hover:bg-white/10 px-6 py-2 rounded-lg font-bold text-white transition-all border border-white/20"
              >
                Subscribe
              </button>
              <button 
                onClick={() => setShowDonate(true)}
                className="flex-1 md:flex-none bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_-5px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2"
                style={{ backgroundColor: creator.channelColor }}
              >
                <DollarSign className="w-4 h-4" />
                Donate
              </button>
            </div>
          </div>

          <div className="mt-8 glass-panel p-6 rounded-xl border border-white/5">
            <h3 className="font-bold text-lg mb-2">About {creator.displayName}</h3>
            <p className="text-zinc-400">{creator.bio}</p>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-full lg:w-[340px] flex-shrink-0 glass-panel rounded-xl flex flex-col h-[500px] lg:h-full border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Live Chat
            </h3>
            <span className="text-xs text-zinc-500"><Users className="w-3 h-3 inline mr-1"/>{stream.viewers.toLocaleString()}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm animate-in fade-in slide-in-from-bottom-2">
                {msg.type === "system" ? (
                  <div className="text-zinc-500 text-center text-xs my-2 italic">{msg.text}</div>
                ) : msg.type === "donation" ? (
                  <div className="bg-primary/20 border border-primary/30 p-2 rounded text-primary font-medium animate-pulse">
                    <Gift className="w-4 h-4 inline mr-2" />
                    {msg.user} {msg.text}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className={`font-bold flex-shrink-0 ${msg.type === "subscriber" ? "text-primary" : "text-zinc-400"}`}>
                      {msg.user}:
                    </span>
                    <span className="text-zinc-200 break-words">{msg.text}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/10 bg-black/40">
            <form onSubmit={handleSendChat} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a message..." 
                className="w-full bg-black/60 border border-white/20 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-zinc-600"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDonate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Donate to {creator.displayName}</h2>
              <button onClick={() => setShowDonate(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex gap-2 mb-6">
              {["L00T", "ETH"].map(t => (
                <button 
                  key={t}
                  onClick={() => setDonateToken(t)}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${donateToken === t ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {["5", "10", "25", "50"].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setDonateAmount(amt)}
                  className={`py-2 rounded bg-white/5 border text-sm font-medium transition-colors hover:bg-white/10 ${donateAmount === amt ? 'border-primary text-primary' : 'border-transparent text-zinc-300'}`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <input 
              type="text" 
              placeholder="Custom Amount" 
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:border-primary transition-all text-center text-lg font-bold"
            />
            
            <input 
              type="text" 
              placeholder="Optional message..." 
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 mb-6 text-white focus:outline-none focus:border-primary transition-all text-sm"
            />

            <button onClick={handleDonate} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_-5px_rgba(56,189,248,0.5)]">
              Send Donation
            </button>
          </div>
        </div>
      )}

      {showSubscribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel p-6 rounded-2xl border border-primary/30 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
            <button onClick={() => setShowSubscribe(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
            
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/50 text-primary">
              <Check className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Subscribe to {creator.displayName}</h2>
            <p className="text-zinc-400 mb-6 text-sm">Unlock exclusive posts, VODs, and a shiny badge in chat.</p>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 text-left">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-zinc-400 font-medium">Duration</span>
                 <span className="text-white font-bold">30 Days</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-zinc-400 font-medium">Price</span>
                 <span className="text-primary font-bold text-lg">0.01 ETH</span>
               </div>
            </div>

            <button onClick={handleSubscribe} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-all">
              Subscribe Now
            </button>
            <p className="text-xs text-zinc-500 mt-4">Powered by Base</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
