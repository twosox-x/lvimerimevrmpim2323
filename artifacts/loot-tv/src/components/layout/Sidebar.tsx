import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, Grid, PlaySquare, Users, LayoutDashboard, PlusSquare } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/", key: "home" },
    { icon: Compass, label: "Explore", href: "/explore", key: "explore" },
    { icon: Grid, label: "Categories", href: "/categories", key: "categories" },
    { icon: PlaySquare, label: "Live", href: "/explore?filter=live", key: "live" },
    { icon: Users, label: "Creators", href: "/creators", key: "creators" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", key: "dashboard" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="fixed top-0 left-0 h-screen z-50 glass-panel border-l-0 border-y-0 w-[68px] hover:w-[240px] transition-all duration-300 overflow-hidden flex flex-col hidden md:flex group"
      >
        <div className="p-4 flex items-center mb-6">
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary fill-current drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <span className="ml-4 font-bold text-xl tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap neon-glow">
            L00T.tv
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-3">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.key === 'live' && location === '/explore');
            return (
              <Link key={item.key} href={item.href}>
                <div 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group/item relative overflow-hidden
                    ${isActive ? 'bg-primary/20 text-primary' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_10px_rgba(56,189,248,1)]" />
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'group-hover/item:text-primary group-hover/item:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all'}`} />
                  <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto mb-4">
          <Link href="/#creator-signup">
            <div className="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 text-zinc-400 hover:text-primary hover:bg-primary/10 group/btn overflow-hidden">
              <PlusSquare className="w-5 h-5 flex-shrink-0 group-hover/btn:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all" />
              <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Become Creator
              </span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 glass-panel border-b-0 border-x-0 md:hidden flex items-center justify-around p-2 pb-safe">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.key} href={item.href}>
              <div className={`flex flex-col items-center justify-center p-2 ${isActive ? 'text-primary' : 'text-zinc-400'}`}>
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
