
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Scheduling from "./pages/Scheduling";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
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
        <SidebarProvider>
          <div className="min-h-screen w-full">
            <MobileLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/agendamento" element={<Scheduling />} />
                <Route path="/loja" element={<Store />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MobileLayout>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
