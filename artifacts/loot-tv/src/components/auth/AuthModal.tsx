import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, User, Video, ChevronRight, Check, Zap, Mail } from "lucide-react";
import { useAuth, shortWallet } from "@/context/AuthContext";
import { categories } from "@/data/categories";
import { DEMO_MODE } from "@/lib/api";

type Step = "entry" | "viewer" | "creator";

const CHANNEL_COLORS = [
  "#38bdf8", "#a78bfa", "#f472b6", "#4ade80",
  "#fb923c", "#f87171", "#facc15", "#34d399",
];

export function AuthModal() {
  const {
    authModalOpen,
    authModalTrigger,
    closeAuthModal,
    connectMockWallet,
    connectWallet,
    mockWalletAddress,
    loginAsViewer,
    loginAsCreator,
  } = useAuth();

  const [step, setStep] = useState<Step>("entry");
  const [walletConnecting, setWalletConnecting] = useState(false);

  // Viewer form
  const [viewerUsername, setViewerUsername] = useState("");
  const [viewerDisplayName, setViewerDisplayName] = useState("");

  // Creator form
  const [creatorUsername, setCreatorUsername] = useState("");
  const [creatorDisplayName, setCreatorDisplayName] = useState("");
  const [creatorBio, setCreatorBio] = useState("");
  const [creatorCategory, setCreatorCategory] = useState("Games");
  const [creatorColor, setCreatorColor] = useState("#38bdf8");

  const [creating, setCreating] = useState(false);
  const [successStep, setSuccessStep] = useState(false);

  // Auth method
  const [authMethod, setAuthMethod] = useState<"demo" | "wallet">("wallet");
  const [emailInput, setEmailInput] = useState("");
  const [emailReady, setEmailReady] = useState(false);

  function handleClose() {
    closeAuthModal();
    setTimeout(() => {
      setStep("entry");
      setWalletConnecting(false);
      setSuccessStep(false);
      setCreating(false);
    }, 300);
  }

  function handleMockConnect() {
    setWalletConnecting(true);
    setTimeout(async () => {
      try {
        await connectWallet();
      } catch (error) {
        if (DEMO_MODE) {
          connectMockWallet();
        } else {
          console.error(error);
        }
      }
      setWalletConnecting(false);
    }, 1200);
  }

  function handleViewerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!viewerUsername.trim() || !viewerDisplayName.trim()) return;
    setCreating(true);
    setTimeout(() => {
      loginAsViewer({ username: viewerUsername.trim(), displayName: viewerDisplayName.trim() });
      setSuccessStep(true);
      setCreating(false);
      setTimeout(handleClose, 1000);
    }, 800);
  }

  function handleCreatorSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorUsername.trim() || !creatorDisplayName.trim()) return;
    setCreating(true);
    setTimeout(() => {
      loginAsCreator({
        username: creatorUsername.trim(),
        displayName: creatorDisplayName.trim(),
        channelColor: creatorColor,
        bio: creatorBio.trim(),
        category: creatorCategory,
      });
      setSuccessStep(true);
      setCreating(false);
      setTimeout(handleClose, 1200);
    }, 900);
  }

  if (!authModalOpen) return null;

  const triggerLabel = authModalTrigger
    ? {
        chat: "to chat",
        donate: "to donate",
        subscribe: "to subscribe",
        dashboard: "to access your dashboard",
        creator: "to create your channel",
      }[authModalTrigger] ?? ""
    : "";

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md z-10"
          >
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Close */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <AnimatePresence mode="wait">
                  {/* ── ENTRY STEP ── */}
                  {step === "entry" && (
                    <motion.div
                      key="entry"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Enter L00T.tv</h2>
                          <p className="text-xs text-zinc-500">Base-native creator streaming</p>
                        </div>
                      </div>

                      {triggerLabel && (
                        <p className="text-sm text-primary/80 mb-4 mt-2">
                          Sign in {triggerLabel}
                        </p>
                      )}

                      <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                        Connect a wallet to chat, tip, subscribe, or launch your own creator channel.
                      </p>

                      {/* Method tabs */}
                      <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-4">
                        {DEMO_MODE && (
                          <button
                            onClick={() => setAuthMethod("demo")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                              authMethod === "demo"
                                ? "bg-primary text-primary-foreground shadow"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Demo
                          </button>
                        )}
                        <button
                          onClick={() => setAuthMethod("wallet")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                            authMethod === "wallet"
                              ? "bg-primary text-primary-foreground shadow"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Wallet
                        </button>
                      </div>

                      {/* Demo method */}
                      {authMethod === "demo" && (
                        <div className="mb-4">
                          {!emailReady ? (
                            <div className="space-y-3">
                              <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && emailInput.trim() && setEmailReady(true)}
                                placeholder="demo handle"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                              />
                              <button
                                onClick={() => setEmailReady(true)}
                                disabled={!emailInput.trim()}
                                className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                              >
                                <ChevronRight className="w-4 h-4" />
                                Continue in Demo Mode
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary" />
                              </div>
                              <p className="text-sm text-white font-medium truncate">{emailInput}</p>
                              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Wallet method */}
                      {authMethod === "wallet" && (
                        <div className="mb-4">
                          {!mockWalletAddress ? (
                            <button
                              onClick={handleMockConnect}
                              disabled={walletConnecting}
                              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl px-4 py-3 transition-all font-medium text-sm group disabled:opacity-60"
                            >
                              {walletConnecting ? (
                                <>
                                  <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                  Connecting…
                                </>
                              ) : (
                                <>
                                  <Wallet className="w-4 h-4 text-primary group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all" />
                                  Connect Wallet
                                  <span className="ml-auto text-xs text-zinc-600">MetaMask / WalletConnect</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 mb-0.5">Wallet connected</p>
                                <p className="font-mono text-sm text-primary font-bold">{shortWallet(mockWalletAddress)}</p>
                              </div>
                              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Role selection — shown once an auth method is ready */}
                      {(emailReady || !!mockWalletAddress) && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setStep("viewer")}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/40 transition-all group"
                        >
                          <User className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-bold text-white">Continue as Viewer</span>
                          <span className="text-xs text-zinc-500">Watch, chat & donate</span>
                        </button>
                        <button
                          onClick={() => setStep("creator")}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 transition-all group"
                        >
                          <Video className="w-6 h-6 text-primary" />
                          <span className="text-sm font-bold text-white">Become a Creator</span>
                          <span className="text-xs text-zinc-400">Launch your channel</span>
                        </button>
                      </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── VIEWER STEP ── */}
                  {step === "viewer" && !successStep && (
                    <motion.div
                      key="viewer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => setStep("entry")}
                        className="text-zinc-500 hover:text-white text-xs flex items-center gap-1 mb-4 transition-colors"
                      >
                        ← Back
                      </button>
                      <h2 className="text-xl font-bold text-white mb-1">Set up your profile</h2>
                      <p className="text-zinc-400 text-sm mb-6">Just the basics — you can update this later.</p>

                      <form onSubmit={handleViewerSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1">Username</label>
                          <input
                            type="text"
                            value={viewerUsername}
                            onChange={(e) => setViewerUsername(e.target.value)}
                            placeholder="e.g. 0xViewer"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1">Display Name</label>
                          <input
                            type="text"
                            value={viewerDisplayName}
                            onChange={(e) => setViewerDisplayName(e.target.value)}
                            placeholder="e.g. CryptoViewer"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={creating}
                          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                        >
                          {creating ? (
                            <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                          ) : (
                            <>
                              Continue
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ── CREATOR STEP ── */}
                  {step === "creator" && !successStep && (
                    <motion.div
                      key="creator"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => setStep("entry")}
                        className="text-zinc-500 hover:text-white text-xs flex items-center gap-1 mb-4 transition-colors"
                      >
                        ← Back
                      </button>
                      <h2 className="text-xl font-bold text-white mb-1">Create your channel</h2>
                      <p className="text-zinc-400 text-sm mb-5">Launch on L00T.tv in seconds.</p>

                      <form onSubmit={handleCreatorSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1">Display Name</label>
                            <input
                              type="text"
                              value={creatorDisplayName}
                              onChange={(e) => setCreatorDisplayName(e.target.value)}
                              placeholder="e.g. 0xNeon"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1">Username</label>
                            <input
                              type="text"
                              value={creatorUsername}
                              onChange={(e) => setCreatorUsername(e.target.value)}
                              placeholder="e.g. 0xneon"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1">Primary Category</label>
                          <select
                            value={creatorCategory}
                            onChange={(e) => setCreatorCategory(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-2 ml-1">Channel Color</label>
                          <div className="flex gap-2 flex-wrap">
                            {CHANNEL_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setCreatorColor(color)}
                                className="w-7 h-7 rounded-full border-2 transition-all"
                                style={{
                                  backgroundColor: color,
                                  borderColor: creatorColor === color ? "#fff" : "transparent",
                                  boxShadow: creatorColor === color ? `0 0 10px ${color}` : "none",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1">Bio</label>
                          <textarea
                            value={creatorBio}
                            onChange={(e) => setCreatorBio(e.target.value)}
                            placeholder="Tell your audience about your channel…"
                            rows={2}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={creating}
                          className="w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                          style={{
                            backgroundColor: creatorColor,
                            color: "#080c14",
                            boxShadow: `0 0 25px -5px ${creatorColor}80`,
                          }}
                        >
                          {creating ? (
                            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : (
                            <>
                              <Video className="w-4 h-4" />
                              Create Channel
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ── SUCCESS ── */}
                  {successStep && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15, delay: 0.1 }}
                        className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mx-auto mb-4"
                        style={{ boxShadow: "0 0 30px -5px rgba(56,189,248,0.5)" }}
                      >
                        <Check className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {step === "creator" ? "Channel created!" : "You're in!"}
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {step === "creator"
                          ? "Your L00T.tv channel is live. Head to your dashboard."
                          : "Welcome to L00T.tv."}
                      </p>
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
