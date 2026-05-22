import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  channelColor?: string;
  onDonationSent?: (amount: string, token: string, message: string) => void;
}

const PRESETS = ["5", "10", "25", "50", "100"];

function mockTxHash(): string {
  const hex = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 64; i++) h += hex[Math.floor(Math.random() * 16)];
  return h;
}

export function DonateModal({
  isOpen,
  onClose,
  creatorName,
  channelColor = "#38bdf8",
  onDonationSent,
}: DonateModalProps) {
  const { isLoggedIn, openAuthModal } = useAuth();

  const [token, setToken] = useState<"L00T" | "ETH">("L00T");
  const [amount, setAmount] = useState("10");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"form" | "pending" | "success">("form");
  const [txHash, setTxHash] = useState("");

  function handleClose() {
    onClose();
    setTimeout(() => {
      setPhase("form");
      setAmount("10");
      setMessage("");
      setTxHash("");
    }, 300);
  }

  function handleDonate() {
    if (!isLoggedIn) {
      onClose();
      openAuthModal("donate");
      return;
    }
    setPhase("pending");
    setTimeout(() => {
      const hash = mockTxHash();
      setTxHash(hash);
      setPhase("success");
      onDonationSent?.(amount, token, message);
    }, 1400);
  }

  if (!isOpen) return null;

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
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div
                className="h-0.5 w-full"
                style={{ background: `linear-gradient(to right, transparent, ${channelColor}, transparent)` }}
              />

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">
                    Donate to{" "}
                    <span style={{ color: channelColor }}>{creatorName}</span>
                  </h2>
                  <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {phase === "form" && (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Token selector */}
                      <div className="flex gap-2 mb-5">
                        {(["L00T", "ETH"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setToken(t)}
                            className="flex-1 py-2 rounded-lg font-bold text-sm transition-all"
                            style={
                              token === t
                                ? { backgroundColor: channelColor, color: "#080c14" }
                                : {}
                            }
                            data-inactive={token !== t ? "true" : undefined}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Preset amounts */}
                      <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {PRESETS.map((p) => (
                          <button
                            key={p}
                            onClick={() => setAmount(p)}
                            className="py-2 rounded-lg text-sm font-bold transition-colors border"
                            style={
                              amount === p
                                ? { borderColor: channelColor, color: channelColor, backgroundColor: `${channelColor}15` }
                                : { borderColor: "rgba(255,255,255,0.1)", color: "rgb(161,161,170)" }
                            }
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      {/* Custom amount */}
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-center text-xl font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mb-3"
                        placeholder="Custom amount"
                      />

                      {/* Message */}
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Optional message…"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mb-5"
                      />

                      <button
                        onClick={handleDonate}
                        className="w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                        style={{
                          backgroundColor: channelColor,
                          color: "#080c14",
                          boxShadow: `0 0 20px -5px ${channelColor}80`,
                        }}
                      >
                        <Gift className="w-4 h-4" />
                        Send {amount} {token}
                      </button>

                      <p className="text-center text-xs text-zinc-600 mt-3">
                        {/* TODO_PAYMENTS: Base transaction integration will connect here */}
                        Base / L00T ERC-20 integration connects here
                      </p>
                    </motion.div>
                  )}

                  {phase === "pending" && (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <div
                        className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
                        style={{ borderColor: channelColor, borderTopColor: "transparent" }}
                      />
                      <p className="font-bold text-white mb-1">Broadcasting transaction…</p>
                      <p className="text-zinc-500 text-sm">Sending {amount} {token} on Base</p>
                    </motion.div>
                  )}

                  {phase === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", damping: 18 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1, damping: 14 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{
                          backgroundColor: `${channelColor}25`,
                          border: `1px solid ${channelColor}60`,
                          boxShadow: `0 0 30px -5px ${channelColor}80`,
                        }}
                      >
                        <Check className="w-8 h-8" style={{ color: channelColor }} />
                      </motion.div>
                      <h3 className="text-lg font-bold text-white mb-1">Donation sent!</h3>
                      <p className="text-zinc-400 text-sm mb-4">
                        {amount} {token} → {creatorName}
                      </p>
                      <div className="bg-black/40 rounded-lg p-3 mb-4">
                        <p className="text-xs text-zinc-500 mb-1">Transaction hash</p>
                        <p className="font-mono text-xs text-zinc-300 break-all">{txHash.slice(0, 32)}…</p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="flex items-center gap-1.5 text-xs mx-auto transition-colors"
                        style={{ color: channelColor }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on BaseScan (mock)
                      </button>
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
