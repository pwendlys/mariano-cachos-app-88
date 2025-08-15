
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
          <SidebarProvider>
            <div className="min-h-screen w-full">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <Index />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
                <Route path="/agendamento" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <SupabaseScheduling />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
                <Route path="/loja" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <SupabaseStore />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
                <Route path="/loja-demo" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <Store />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
                <Route path="/carrinho" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <SupabaseCart />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
                <Route path="/carrinho-demo" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <Cart />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <MobileLayout>
                      <Admin />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
                <Route path="/perfil" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <Profile />
                    </MobileLayout>
                  </ProtectedRoute>
                  } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
