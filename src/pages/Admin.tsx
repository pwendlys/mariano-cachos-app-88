
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppSidebar from '@/components/admin/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppointmentsTab from '@/components/AppointmentsTab';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import ClientList from '@/components/ClientList';
import CustomerProfileManagement from '@/components/CustomerProfileManagement';
import DebtCollectionsDashboard from '@/components/DebtCollectionsDashboard';
import DebtCollectionManagement from '@/components/DebtCollectionManagement';
import CommissionManagement from '@/components/CommissionManagement';
import ProfessionalsTabManager from '@/components/ProfessionalsTabManager';
import BannerManagement from '@/components/BannerManagement';
import GalleryManagement from '@/components/GalleryManagement';
import Dashboard from '@/components/admin/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useSupabaseSales } from '@/hooks/useSupabaseSales';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { sales } = useSupabaseSales();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Verificar se o usuário tem acesso aos tabs baseado no tipo
  const getAvailableTabs = () => {
    if (user?.tipo === 'admin') {
      return [
        'dashboard', 'agendamentos', 'servicos', 'produtos', 'vendas', 
        'clientes', 'atendimentos', 'cobrancas', 'fluxo-caixa', 'banner', 'galeria', 'configuracoes'
      ];
    } else if (user?.tipo === 'convidado') {
      return ['agendamentos', 'servicos', 'produtos', 'cobrancas', 'banner', 'galeria'];
    }
    return ['agendamentos'];
  };

  const availableTabs = getAvailableTabs();
  
  // Verificar se o tab atual é permitido, senão redirecionar para o primeiro disponível
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      const firstAvailableTab = availableTabs[0] || 'agendamentos';
      setActiveTab(firstAvailableTab);
      setSearchParams({ tab: firstAvailableTab });
    }
  }, [availableTabs, activeTab, setSearchParams]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'agendamentos':
        return <AppointmentsTab />;
      case 'servicos':
        return <ServiceManagement />;
      case 'produtos':
        return <ProductManagement />;
      case 'vendas':
        return (
          <Tabs defaultValue="vendas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card border-salon-gold/20">
              <TabsTrigger value="vendas">Vendas</TabsTrigger>
              <TabsTrigger value="comissoes">Comissões</TabsTrigger>
            </TabsList>
            <TabsContent value="vendas" className="space-y-6 mt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">Vendas</h2>
                <p className="text-muted-foreground">Gerencie as vendas do salão</p>
              </div>
              <div className="text-center p-8">
                <p className="text-muted-foreground">Funcionalidade de vendas em desenvolvimento</p>
              </div>
            </TabsContent>
            <TabsContent value="comissoes" className="space-y-6 mt-6">
              <CommissionManagement />
            </TabsContent>
          </Tabs>
        );
      case 'atendimentos':
        return <CustomerProfileManagement />;
      case 'cobrancas':
        return <DebtCollectionsDashboard />;
      case 'fluxo-caixa':
        return <CashFlowManagement />;
      case 'clientes':
        return <ClientList />;
      case 'banner':
        return <BannerManagement />;
      case 'galeria':
        return <GalleryManagement />;
      case 'configuracoes':
        return <ProfessionalsTabManager />;
      default:
        return <div>Tab não encontrada</div>;
    }
  };

  const getTabDisplayName = (tab: string) => {
    const displayNames: Record<string, string> = {
      dashboard: 'Dashboard',
      agendamentos: 'Agendamentos',
      servicos: 'Serviços',
      produtos: 'Produtos',
      vendas: 'Vendas',
      clientes: 'Clientes',
      atendimentos: 'Atendimentos',
      cobrancas: 'Cobranças',
      'fluxo-caixa': 'Fluxo de Caixa',
      banner: 'Banner',
      galeria: 'Galeria',
      configuracoes: 'Profissionais'
    };
    return displayNames[tab] || tab;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-salon-dark via-gray-900 to-black">
        <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <span className="text-sm font-medium text-salon-copper">Admin</span>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <span className="text-salon-copper">/</span>
                      <span className="ml-1 text-sm font-medium text-salon-gold md:ml-2">
                        {getTabDisplayName(activeTab)}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            
            {renderTabContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
