import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Home, Compass, Grid, Users, LayoutDashboard,
  PlusSquare, LogOut, Wallet, Video,
} from "lucide-react";
import { useAuth, shortWallet } from "@/context/AuthContext";
import { DEFAULT_PROFILE_PICTURE } from "@/data/creators";

export function Sidebar() {
  const [location] = useLocation();
  const { user, isLoggedIn, isCreator, logout, openAuthModal } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", href: "/", key: "home" },
    { icon: Compass, label: "Explore", href: "/explore", key: "explore" },
    { icon: Grid, label: "Categories", href: "/categories", key: "categories" },
    { icon: Users, label: "Creators", href: "/creators", key: "creators" },
  ];

  function handleDashboardClick() {
    if (!isLoggedIn) { openAuthModal("dashboard"); return; }
    if (!isCreator) { openAuthModal("dashboard"); return; }
    // Navigate to dashboard (link handles this)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 h-screen z-50 glass-panel border-l-0 border-y-0 w-[68px] hover:w-[240px] transition-all duration-300 overflow-hidden flex flex-col hidden md:flex group">
        {/* Logo */}
        <div className="p-4 flex items-center mb-4 flex-shrink-0">
          <div className="w-9 flex-shrink-0 flex items-center justify-center">
            <img src="/loot-logo.png" alt="L00T" className="w-9 h-auto object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-hidden">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.key} href={item.href}>
                <div
                  className={`relative flex items-center p-3 rounded-lg cursor-pointer group/item
                    ${isActive ? "text-primary" : "text-zinc-400 hover:text-white"}`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 shadow-[0_0_14px_rgba(56,189,248,0.18)]"
                      transition={{ type: "spring", stiffness: 500, damping: 42 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${
                    isActive
                      ? "drop-shadow-[0_0_8px_rgba(56,189,248,0.75)]"
                      : "group-hover/item:text-primary group-hover/item:drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] transition-all"
                  }`} />
                  <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap relative z-10">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Dashboard — only visible when creator, gate otherwise */}
          {isCreator ? (
            <Link href="/dashboard">
              <div
                className={`relative flex items-center p-3 rounded-lg cursor-pointer group/item
                  ${location === "/dashboard" ? "text-primary" : "text-zinc-400 hover:text-white"}`}
              >
                {location === "/dashboard" && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 shadow-[0_0_14px_rgba(56,189,248,0.18)]"
                    transition={{ type: "spring", stiffness: 500, damping: 42 }}
                  />
                )}
                <LayoutDashboard className="w-5 h-5 flex-shrink-0 relative z-10" />
                <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap relative z-10">
                  Dashboard
                </span>
              </div>
            </Link>
          ) : (
            <button
              onClick={handleDashboardClick}
              className="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 w-full text-left group/item"
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-zinc-600">
                Dashboard
              </span>
            </button>
          )}
        </nav>

        {/* Bottom user area */}
        <div className="p-3 mt-auto flex-shrink-0 border-t border-white/5">
          {isLoggedIn && user ? (
            <div className="space-y-1">
              {/* My Channel shortcut for creators */}
              {isCreator && (
                <Link href={`/creator/${user.username}`}>
                  <div className="flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 text-zinc-400 hover:text-primary hover:bg-primary/10 group/btn overflow-hidden">
                    <Video className="w-4 h-4 flex-shrink-0 group-hover/btn:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all" />
                    <span className="ml-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
                      My Channel
                    </span>
                  </div>
                </Link>
              )}

              {/* User info */}
              <div className="flex items-center h-11 px-1.5 group-hover:px-2.5 gap-3 rounded-lg overflow-hidden min-w-0 transition-[padding] duration-300">
                <div className="w-8 h-8 min-w-8 min-h-8 shrink-0 rounded-full border border-white/10 overflow-hidden bg-zinc-900">
                  <img
                    src={user.avatarUrl || DEFAULT_PROFILE_PICTURE}
                    alt={user.displayName}
                    className="block w-full h-full aspect-square object-cover"
                  />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{user.displayName}</p>
                  <p className="text-zinc-500 text-xs font-mono">{shortWallet(user.walletAddress)}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 w-full group/logout overflow-hidden"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="ml-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
                  Sign Out
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 text-zinc-400 hover:text-primary hover:bg-primary/10 group/btn overflow-hidden w-full"
            >
              <Wallet className="w-5 h-5 flex-shrink-0 group-hover/btn:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all" />
              <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Sign In
              </span>
            </button>
          )}

          {/* Become Creator CTA if viewer */}
          {isLoggedIn && !isCreator && (
            <button
              onClick={() => openAuthModal("creator")}
              className="flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 text-zinc-500 hover:text-primary hover:bg-primary/10 group/btn overflow-hidden w-full mt-1"
            >
              <PlusSquare className="w-4 h-4 flex-shrink-0" />
              <span className="ml-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
                Become Creator
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 glass-panel border-b-0 border-x-0 md:hidden flex items-center justify-around p-2 pb-safe">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.key} href={item.href}>
              <div className={`flex flex-col items-center justify-center p-2 ${isActive ? "text-primary" : "text-zinc-400"}`}>
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
        {/* Auth button on mobile */}
        {isLoggedIn ? (
          <Link href={isCreator ? "/dashboard" : "/creators"}>
            <div className="flex flex-col items-center justify-center p-2 text-zinc-400">
              <div className="w-5 h-5 min-w-5 min-h-5 shrink-0 rounded-full mb-1 overflow-hidden bg-zinc-900">
                <img src={user?.avatarUrl || DEFAULT_PROFILE_PICTURE} className="block w-full h-full aspect-square object-cover" alt="avatar" />
              </div>
              <span className="text-[10px] font-medium truncate max-w-[48px]">{user?.displayName}</span>
            </div>
          </Link>
        ) : (
          <button onClick={() => openAuthModal()} className="flex flex-col items-center justify-center p-2 text-zinc-400 hover:text-primary transition-colors">
            <Wallet className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Sign In</span>
          </button>
        )}
      </nav>
    </>
  );
}
