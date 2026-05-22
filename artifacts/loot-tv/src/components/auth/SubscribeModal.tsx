import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  channelColor?: string;
  onSubscribed?: () => void;
}

function mockExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function SubscribeModal({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  channelColor = "#38bdf8",
  onSubscribed,
}: SubscribeModalProps) {
  const { isLoggedIn, openAuthModal, subscribeToCreator, isSubscribedTo } = useAuth();
  const isAlreadySubbed = isSubscribedTo(creatorId);

  const [token, setToken] = useState<"ETH" | "L00T">("ETH");
  const [phase, setPhase] = useState<"form" | "pending" | "success">(
    isAlreadySubbed ? "success" : "form"
  );
  const [expiry] = useState(mockExpiry);

  function handleClose() {
    onClose();
    setTimeout(() => {
      if (!isAlreadySubbed) setPhase("form");
    }, 300);
  }

  function handleSubscribe() {
    if (!isLoggedIn) {
      onClose();
      openAuthModal("subscribe");
      return;
    }
    setPhase("pending");
    setTimeout(() => {
      subscribeToCreator(creatorId);
      setPhase("success");
      onSubscribed?.();
    }, 1200);
  }

  if (!isOpen) return null;

  const price = token === "ETH" ? "0.01 ETH" : "100,000 L00T";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-sm z-10"
          >
            <div className="glass-panel rounded-2xl border overflow-hidden" style={{ borderColor: `${channelColor}50` }}>
              <div
                className="h-0.5 w-full"
                style={{ background: `linear-gradient(to right, transparent, ${channelColor}, transparent)` }}
              />

              <div className="p-6">
                <button onClick={handleClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <AnimatePresence mode="wait">
                  {/* Already subscribed */}
                  {(phase === "success" || isAlreadySubbed) && (
                    <motion.div
                      key="subbed"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-2"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{
                          backgroundColor: `${channelColor}20`,
                          border: `1px solid ${channelColor}60`,
                          boxShadow: `0 0 30px -5px ${channelColor}60`,
                        }}
                      >
                        <Star className="w-8 h-8" style={{ color: channelColor }} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Subscribed!</h3>
                      <p className="text-zinc-400 text-sm mb-4">
                        You have full access to {creatorName}'s exclusive content.
                      </p>
                      <div className="bg-black/40 rounded-xl p-4 text-left mb-5">
                        <div className="flex justify-between mb-2">
                          <span className="text-zinc-500 text-sm">Plan</span>
                          <span className="text-white text-sm font-bold">30 Days</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-zinc-500 text-sm">Status</span>
                          <span className="text-sm font-bold" style={{ color: channelColor }}>Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 text-sm">Expires</span>
                          <span className="text-white text-sm font-mono">{expiry}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                        style={{ backgroundColor: `${channelColor}20`, color: channelColor, border: `1px solid ${channelColor}40` }}
                      >
                        Close
                      </button>
                    </motion.div>
                  )}

                  {/* Subscribe form */}
                  {phase === "form" && !isAlreadySubbed && (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="text-center mb-5">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                          style={{ backgroundColor: `${channelColor}20`, border: `1px solid ${channelColor}40` }}
                        >
                          <Lock className="w-6 h-6" style={{ color: channelColor }} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">
                          Subscribe to {creatorName}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                          Unlock exclusive posts, subscriber-only streams, and a badge in chat.
                        </p>
                      </div>

                      <div className="flex gap-2 mb-4">
                        {(["ETH", "L00T"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setToken(t)}
                            className="flex-1 py-2 rounded-lg font-bold text-sm transition-all border"
                            style={
                              token === t
                                ? { backgroundColor: channelColor, color: "#080c14", borderColor: channelColor }
                                : { borderColor: "rgba(255,255,255,0.1)", color: "rgb(161,161,170)" }
                            }
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="bg-black/40 rounded-xl p-4 mb-5">
                        <div className="flex justify-between mb-2">
                          <span className="text-zinc-400 text-sm">Duration</span>
                          <span className="text-white text-sm font-bold">30 Days</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-zinc-400 text-sm">Price</span>
                          <span className="text-lg font-bold" style={{ color: channelColor }}>{price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400 text-sm">Platform fee</span>
                          <span className="text-green-400 text-sm font-bold">Zero</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-5">
                        {["Subscriber-only posts", "Subscriber-only streams", "Subscriber badge in chat"].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                            <Check className="w-4 h-4 flex-shrink-0" style={{ color: channelColor }} />
                            {item}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={handleSubscribe}
                        className="w-full font-bold py-3 rounded-xl transition-all shadow-lg"
                        style={{
                          backgroundColor: channelColor,
                          color: "#080c14",
                          boxShadow: `0 0 20px -5px ${channelColor}80`,
                        }}
                      >
                        Subscribe — {price}
                      </button>
                      <p className="text-center text-xs text-zinc-600 mt-2">
                        {/* TODO_SUBSCRIPTIONS: Base payment + on-chain pass will connect here */}
                        Powered by Base · No auto-renew
                      </p>
                    </motion.div>
                  )}

                  {/* Pending */}
                  {phase === "pending" && (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-10"
                    >
                      <div
                        className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
                        style={{ borderColor: channelColor, borderTopColor: "transparent" }}
                      />
                      <p className="font-bold text-white mb-1">Processing subscription…</p>
                      <p className="text-zinc-500 text-sm">Verifying {price} on Base</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
