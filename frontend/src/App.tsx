import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";

import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AICompanion from "@/pages/AICompanion";
import Journal from "@/pages/Journal";
import LifeCapsule from "@/pages/LifeCapsule";
import Goals from "@/pages/Goals";
import VisionBoards from "@/pages/VisionBoards";
import DailyPhoto from "@/pages/DailyPhoto";
import Connections from "@/pages/Connections";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ai" element={<AICompanion />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/life-capsule" element={<LifeCapsule />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/vision-boards" element={<VisionBoards />} />
                  <Route path="/daily-photo" element={<DailyPhoto />} />
                  <Route path="/connections" element={<Connections />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Backward-compatible aliases */}
                  <Route path="/vision" element={<Navigate to="/vision-boards" replace />} />
                  <Route path="/vision-board" element={<Navigate to="/vision-boards" replace />} />
                  <Route path="/daily" element={<Navigate to="/daily-photo" replace />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
