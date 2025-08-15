
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  Scissors,
  Package,
  Users,
  DollarSign,
  Calculator,
  FileText,
  Image,
  ImageIcon,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
}

const items: SidebarItem[] = [
  { title: "Dashboard", url: "/admin?tab=dashboard", icon: BarChart3 },
  { title: "Agendamentos", url: "/admin?tab=agendamentos", icon: Calendar },
  { title: "Serviços", url: "/admin?tab=servicos", icon: Scissors },
  { title: "Produtos", url: "/admin?tab=produtos", icon: Package },
  { title: "Profissionais", url: "/admin?tab=profissionais", icon: Users },
  { title: "Caixa", url: "/admin?tab=caixa", icon: DollarSign },
  { title: "Comissões", url: "/admin?tab=comissoes", icon: Calculator },
  { title: "Cobranças", url: "/admin?tab=cobrancas", icon: FileText },
  { title: "Banner", url: "/admin?tab=banner", icon: Image },
  { title: "Galeria", url: "/admin?tab=galeria", icon: ImageIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';
  
  const isActive = (url: string) => {
    const tabFromUrl = new URLSearchParams(new URL(url, window.location.origin).search).get('tab');
    return currentTab === tabFromUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase.auth.token');
    navigate('/login');
    toast({
      title: "Logout realizado",
      description: "Você será redirecionado para a página de login.",
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-salon-gold/20">
      <SidebarHeader className="border-b border-salon-gold/20 p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-salon-gold to-salon-copper flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-salon-dark" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-bold text-gradient-gold font-playfair">Admin</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-salon-copper">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-salon-gold/20 p-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start gap-2 border-salon-gold/20 text-salon-copper hover:bg-salon-gold/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
