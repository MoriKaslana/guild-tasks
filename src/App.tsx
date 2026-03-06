import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GameProvider, useGame } from "@/context/GameContext";
import AppSidebar from "@/components/AppSidebar";
import PlayerStatusBar from "@/components/PlayerStatusBar";
import AuthScreen from "@/components/AuthScreen";
import QuestBoard from "@/pages/QuestBoard";
import ReviewBoard from "@/pages/ReviewBoard";
import Tavern from "@/pages/Tavern";
import Codex from "@/pages/Codex";
import HallOfFame from "@/pages/HallOfFame";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { currentUser } = useGame();

  if (!currentUser) return <AuthScreen />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b border-border px-2">
            <div className="flex items-center">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <span className="ml-3 font-heading text-sm text-muted-foreground">
                {currentUser.role === "guild_master" ? "👑 Guild Master" : "⚔️ Adventurer"} — {currentUser.username}
              </span>
            </div>
            <PlayerStatusBar />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/quests" element={<QuestBoard />} />
              <Route path="/review" element={<ReviewBoard />} />
              <Route path="/tavern" element={<Tavern />} />
              <Route path="/codex" element={<Codex />} />
              <Route path="/fame" element={<HallOfFame />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Navigate to="/quests" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameProvider>
        <BrowserRouter>
          <AuthenticatedApp />
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
