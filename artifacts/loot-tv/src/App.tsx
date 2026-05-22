import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import NotFound from "@/pages/not-found";

import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import CategoriesPage from "@/pages/CategoriesPage";
import StreamRoomPage from "@/pages/StreamRoomPage";
import CreatorProfilePage from "@/pages/CreatorProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import CreatorsPage from "@/pages/CreatorsPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/stream/:id" component={StreamRoomPage} />
      <Route path="/@:username" component={CreatorProfilePage} />
      <Route path="/creator/:username" component={CreatorProfilePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/creators" component={CreatorsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
            {/* Global auth modal — rendered outside page tree so it overlays everything */}
            <AuthModal />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
