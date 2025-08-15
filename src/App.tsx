
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SupabaseScheduling from "./pages/SupabaseScheduling";
import Store from "./pages/Store";
import SupabaseStore from "./pages/SupabaseStore";
import Cart from "./pages/Cart";
import SupabaseCart from "./pages/SupabaseCart";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MobileLayout from "./components/MobileLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen w-full">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <MobileLayout>
                      <Index />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/agendamento" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <MobileLayout>
                      <SupabaseScheduling />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/loja" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <MobileLayout>
                      <SupabaseStore />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/loja-demo" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <MobileLayout>
                      <Store />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/carrinho" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <MobileLayout>
                      <SupabaseCart />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/carrinho-demo" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <MobileLayout>
                      <Cart />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <SidebarProvider>
                    <MobileLayout>
                      <Admin />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <MobileLayout>
                      <Profile />
                    </MobileLayout>
                  </SidebarProvider>
                </ProtectedRoute>
                } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
