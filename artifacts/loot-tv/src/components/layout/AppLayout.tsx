import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { HoneycombBg } from "./HoneycombBg";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground">
      <HoneycombBg />
      <Sidebar />
      {/* Margin left offsets sidebar collapsed state (68px). On mobile, padding bottom for nav bar */}
      <main className="md:ml-[68px] pb-20 md:pb-0 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
