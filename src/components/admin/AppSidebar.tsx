
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { 
  Calendar, 
  Scissors, 
  Package, 
  DollarSign, 
  Users, 
  CreditCard,
  TrendingUp,
  Settings,
  Image,
  Camera,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  // Definir itens do menu baseado no tipo de usuário
  const getMenuItems = () => {
    const allItems = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: BarChart3,
        allowedRoles: ['admin'] // Apenas admin
      },
      {
        id: 'agendamentos',
        title: 'Agendamentos',
        icon: Calendar,
        allowedRoles: ['admin', 'convidado']
      },
      {
        id: 'servicos',
        title: 'Serviços',
        icon: Scissors,
        allowedRoles: ['admin', 'convidado']
      },
      {
        id: 'produtos',
        title: 'Produtos',
        icon: Package,
        allowedRoles: ['admin', 'convidado']
      },
      {
        id: 'vendas',
        title: 'Vendas',
        icon: DollarSign,
        allowedRoles: ['admin'] // Apenas admin
      },
      {
        id: 'clientes',
        title: 'Clientes',
        icon: Users,
        allowedRoles: ['admin'] // Apenas admin
      },
      {
        id: 'cobrancas',
        title: 'Cobranças',
        icon: CreditCard,
        allowedRoles: ['admin', 'convidado']
      },
      {
        id: 'fluxo-caixa',
        title: 'Fluxo de Caixa',
        icon: TrendingUp,
        allowedRoles: ['admin'] // Apenas admin
      },
      {
        id: 'banner',
        title: 'Banner',
        icon: Image,
        allowedRoles: ['admin', 'convidado']
      },
      {
        id: 'galeria',
        title: 'Galeria',
        icon: Camera,
        allowedRoles: ['admin', 'convidado']
      },
      {
        id: 'configuracoes',
        title: 'Configurações',
        icon: Settings,
        allowedRoles: ['admin'] // Apenas admin
      }
    ];

    // Filtrar itens baseado no tipo de usuário (usando tipo já normalizado)
    return allItems.filter(item => 
      user?.tipo && item.allowedRoles.includes(user.tipo)
    );
  };

  const menuItems = getMenuItems();

  console.log('User tipo:', user?.tipo, 'Menu items:', menuItems.length);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-salon-gold/20 p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-salon-gold rounded-md flex items-center justify-center">
            <Scissors className="w-4 h-4 text-salon-dark" />
          </div>
          <div>
            <h2 className="font-semibold text-salon-gold">Admin Panel</h2>
            <p className="text-xs text-salon-copper capitalize">
              {user?.tipo === 'convidado' ? 'Usuário Convidado' : 
               user?.tipo === 'admin' ? 'Administrador' : 'Cliente'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-salon-gold">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className="data-[active=true]:bg-salon-gold/20 data-[active=true]:text-salon-gold hover:bg-salon-gold/10"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-salon-gold/20 p-4">
        <div className="text-xs text-salon-copper">
          Logado como: <span className="text-salon-gold">{user?.nome}</span>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
