import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { DEMO_MODE, apiRequest } from "@/lib/api";
import { DEFAULT_PROFILE_PICTURE } from "@/data/creators";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  role: "viewer" | "creator";
  walletAddress: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl?: string;
  bannerGradient: string;
  channelColor: string;
  isCreator: boolean;
  subscriptions: string[]; // creator IDs the user is subscribed to
  bio: string;
  category: string;
  streamTitle: string;
  streamIsLive: boolean;
}

export interface CreatorPost {
  id: string;
  creatorId: string;
  content: string;
  createdAt: string;
  isSubscriberOnly: boolean;
  likes: number;
  comments: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isCreator: boolean;
  mockWalletAddress: string | null;
  authModalOpen: boolean;
  authModalTrigger: string;
  openAuthModal: (trigger?: string) => void;
  closeAuthModal: () => void;
  connectMockWallet: () => void;
  connectWallet: () => Promise<void>;
  loginAsViewer: (data: Pick<AuthUser, "username" | "displayName">) => void;
  loginAsCreator: (
    data: Pick<AuthUser, "username" | "displayName" | "channelColor" | "bio" | "category">
  ) => void;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  subscribeToCreator: (creatorId: string) => void;
  isSubscribedTo: (creatorId: string) => boolean;
  creatorPosts: CreatorPost[];
  addCreatorPost: (post: Omit<CreatorPost, "id" | "creatorId" | "createdAt" | "likes" | "comments">) => void;
  setStreamLive: (isLive: boolean, title?: string) => void;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_USER = "loot_auth_user";
const LS_WALLET = "loot_mock_wallet";
const LS_POSTS = "loot_creator_posts";

const BANNER_PRESETS = [
  "bg-gradient-to-r from-blue-600 to-cyan-400",
  "bg-gradient-to-r from-purple-600 to-indigo-500",
  "bg-gradient-to-r from-pink-500 to-rose-400",
  "bg-gradient-to-r from-emerald-500 to-teal-400",
];

function generateWalletAddress(): string {
  const hex = "0123456789ABCDEF";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

function shortWallet(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LS_USER);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    return { ...user, avatarUrl: user.avatarUrl || DEFAULT_PROFILE_PICTURE };
  } catch {
    return null;
  }
}

function saveUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(LS_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(LS_USER);
  }
}

function loadWallet(): string | null {
  return localStorage.getItem(LS_WALLET);
}

function saveWallet(addr: string | null): void {
  if (addr) localStorage.setItem(LS_WALLET, addr);
  else localStorage.removeItem(LS_WALLET);
}

function loadPosts(): CreatorPost[] {
  try {
    const raw = localStorage.getItem(LS_POSTS);
    return raw ? (JSON.parse(raw) as CreatorPost[]) : [];
  } catch {
    return [];
  }
}

function savePosts(posts: CreatorPost[]): void {
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [mockWalletAddress, setMockWalletAddress] = useState<string | null>(loadWallet);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTrigger, setAuthModalTrigger] = useState("");
  const [creatorPosts, setCreatorPosts] = useState<CreatorPost[]>(loadPosts);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    saveUser(user);
  }, [user]);

  // Persist wallet address
  useEffect(() => {
    saveWallet(mockWalletAddress);
  }, [mockWalletAddress]);

  // Persist posts
  useEffect(() => {
    savePosts(creatorPosts);
  }, [creatorPosts]);

  const openAuthModal = useCallback((trigger = "") => {
    setAuthModalTrigger(trigger);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalTrigger("");
  }, []);

  const connectMockWallet = useCallback(() => {
    if (!DEMO_MODE) {
      throw new Error("Demo wallet login is disabled. Connect a real wallet.");
    }
    if (!mockWalletAddress) {
      const addr = generateWalletAddress();
      setMockWalletAddress(addr);
    }
  }, [mockWalletAddress]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      if (DEMO_MODE) {
        connectMockWallet();
        return;
      }
      throw new Error("No wallet provider found");
      return;
    }

    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
    const walletAddress = accounts[0];
    if (!walletAddress) throw new Error("No wallet account selected");
    setMockWalletAddress(walletAddress);

    const nonce = await apiRequest<{ message: string }>("/auth/nonce", {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
    });
    const signature = (await window.ethereum.request({
      method: "personal_sign",
      params: [nonce.message, walletAddress],
    })) as string;
    await apiRequest("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ walletAddress, signature }),
    });
  }, [connectMockWallet]);

  const loginAsViewer = useCallback(
    (data: Pick<AuthUser, "username" | "displayName">) => {
      if (!DEMO_MODE && !mockWalletAddress) {
        throw new Error("Wallet session required");
      }
      const wallet = mockWalletAddress ?? generateWalletAddress();
      if (!mockWalletAddress) setMockWalletAddress(wallet);

      const newUser: AuthUser = {
        id: `viewer_${Date.now()}`,
        role: "viewer",
        walletAddress: wallet,
        username: data.username,
        displayName: data.displayName,
        avatarUrl: DEFAULT_PROFILE_PICTURE,
        bannerUrl: "",
        bannerGradient: BANNER_PRESETS[0],
        channelColor: "#38bdf8",
        isCreator: false,
        subscriptions: [],
        bio: "",
        category: "",
        streamTitle: "",
        streamIsLive: false,
      };
      setUser(newUser);
      closeAuthModal();
    },
    [mockWalletAddress, closeAuthModal]
  );

  const loginAsCreator = useCallback(
    (data: Pick<AuthUser, "username" | "displayName" | "channelColor" | "bio" | "category">) => {
      if (!DEMO_MODE && !mockWalletAddress) {
        throw new Error("Wallet session required");
      }
      const wallet = mockWalletAddress ?? generateWalletAddress();
      if (!mockWalletAddress) setMockWalletAddress(wallet);

      const newUser: AuthUser = {
        id: `creator_${Date.now()}`,
        role: "creator",
        walletAddress: wallet,
        username: data.username,
        displayName: data.displayName,
        avatarUrl: DEFAULT_PROFILE_PICTURE,
        bannerUrl: "",
        bannerGradient: BANNER_PRESETS[Math.floor(Math.random() * BANNER_PRESETS.length)],
        channelColor: data.channelColor || "#38bdf8",
        isCreator: true,
        subscriptions: [],
        bio: data.bio || "",
        category: data.category || "Games",
        streamTitle: "My First Stream",
        streamIsLive: false,
      };
      setUser(newUser);
      closeAuthModal();
    },
    [mockWalletAddress, closeAuthModal]
  );

  const logout = useCallback(() => {
    void apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setMockWalletAddress(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const subscribeToCreator = useCallback((creatorId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const subs = prev.subscriptions.includes(creatorId)
        ? prev.subscriptions
        : [...prev.subscriptions, creatorId];
      return { ...prev, subscriptions: subs };
    });
  }, []);

  const isSubscribedTo = useCallback(
    (creatorId: string) => {
      return user?.subscriptions.includes(creatorId) ?? false;
    },
    [user]
  );

  const addCreatorPost = useCallback(
    (post: Omit<CreatorPost, "id" | "creatorId" | "createdAt" | "likes" | "comments">) => {
      if (!user) return;
      const newPost: CreatorPost = {
        id: `post_${Date.now()}`,
        creatorId: user.id,
        content: post.content,
        isSubscriberOnly: post.isSubscriberOnly,
        createdAt: "just now",
        likes: 0,
        comments: 0,
      };
      setCreatorPosts((prev) => [newPost, ...prev]);
    },
    [user]
  );

  const setStreamLive = useCallback((isLive: boolean, title?: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        streamIsLive: isLive,
        streamTitle: title ?? prev.streamTitle,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isCreator: user?.role === "creator",
        mockWalletAddress,
        authModalOpen,
        authModalTrigger,
        openAuthModal,
        closeAuthModal,
        connectMockWallet,
        connectWallet,
        loginAsViewer,
        loginAsCreator,
        logout,
        updateProfile,
        subscribeToCreator,
        isSubscribedTo,
        creatorPosts,
        addCreatorPost,
        setStreamLive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useRequireAuth(trigger?: string): { isLoggedIn: boolean; openAuthModal: () => void } {
  const { isLoggedIn, openAuthModal } = useAuth();
  return {
    isLoggedIn,
    openAuthModal: () => openAuthModal(trigger),
  };
}

export { shortWallet };
