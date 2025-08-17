
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppSidebar from '@/components/admin/AppSidebar';
import Dashboard from '@/components/admin/Dashboard';
import AppointmentsTab from '@/components/AppointmentsTab';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import ClientList from '@/components/ClientList';
import CustomerProfileManagement from '@/components/CustomerProfileManagement';
import DebtCollectionsDashboard from '@/components/DebtCollectionsDashboard';
import DebtCollectionManagement from '@/components/DebtCollectionManagement';
import CommissionManagement from '@/components/CommissionManagement';
import BannerManagement from '@/components/BannerManagement';
import GalleryManagement from '@/components/GalleryManagement';
import ProfessionalsTabManager from '@/components/ProfessionalsTabManager';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseCashFlow } from '@/hooks/useSupabaseCashFlow';

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Use the cash flow hook to get appointments data
  const { appointments, loading, updateAppointmentCollectionStatus } = useSupabaseCashFlow();

  // Definir abas permitidas por tipo de usuário (usando tipo já normalizado)
  const getAllowedTabs = () => {
    if (user?.tipo === 'admin') {
      return [
        'dashboard', 'agendamentos', 'servicos', 'produtos', 'vendas', 
        'clientes', 'atendimentos', 'cobrancas', 'fluxo-caixa', 'banner', 'galeria', 'configuracoes'
      ];
    } else if (user?.tipo === 'convidado') {
      return ['agendamentos', 'servicos', 'produtos', 'cobrancas', 'banner', 'galeria'];
    }
    return [];
  };

  const allowedTabs = getAllowedTabs();

  console.log('User tipo:', user?.tipo, 'Allowed tabs:', allowedTabs, 'Current tab:', tabFromUrl);

  useEffect(() => {
    // Se a aba atual não é permitida para o usuário, redirecionar
    if (!allowedTabs.includes(tabFromUrl)) {
      const defaultTab = user?.tipo === 'convidado' ? 'agendamentos' : 'dashboard';
      setActiveTab(defaultTab);
      setSearchParams({ tab: defaultTab });
    } else {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, user?.tipo, allowedTabs, setSearchParams]);

  const handleTabChange = (tab: string) => {
    // Verificar se o usuário tem permissão para acessar esta aba
    if (!allowedTabs.includes(tab)) {
      return; // Não permitir mudança
    }
    
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const getTabTitle = (tab: string) => {
    const titles: { [key: string]: string } = {
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
      configuracoes: 'Configurações'
    };
    return titles[tab] || 'Admin';
  };

  const renderTabContent = () => {
    // Verificar novamente se o usuário tem permissão
    if (!allowedTabs.includes(activeTab)) {
      return <div className="p-8 text-center text-salon-copper">Acesso negado a esta seção.</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'agendamentos':
        return (
          <AppointmentsTab 
            appointments={appointments}
            onUpdateCollectionStatus={updateAppointmentCollectionStatus}
            loading={loading}
          />
        );
      case 'servicos':
        return <ServiceManagement />;
      case 'produtos':
        return <ProductManagement />;
      case 'vendas':
        return <CashFlowManagement />;
      case 'clientes':
        return (
          <Tabs defaultValue="clientes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="clientes" className="text-salon-gold data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark">
                Lista de Clientes
              </TabsTrigger>
              <TabsTrigger value="usuarios-devedores" className="text-salon-gold data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark">
                Usuários & Devedores
              </TabsTrigger>
            </TabsList>
            <TabsContent value="clientes">
              <ClientList />
            </TabsContent>
            <TabsContent value="usuarios-devedores">
              <DebtCollectionManagement />
            </TabsContent>
          </Tabs>
        );
      case 'atendimentos':
        return <CustomerProfileManagement />;
      case 'cobrancas':
        return <DebtCollectionsDashboard />;
      case 'fluxo-caixa':
        return <CashFlowManagement />;
      case 'banner':
        return <BannerManagement />;
      case 'galeria':
        return <GalleryManagement />;
      case 'configuracoes':
        return <ProfessionalsTabManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-salon-gold/20 px-4">
            <SidebarTrigger className="-ml-1 text-salon-gold hover:bg-salon-gold/10" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-salon-gold/20" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin" className="text-salon-copper hover:text-salon-gold">
                    Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-salon-copper" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-salon-gold">
                    {getTabTitle(activeTab)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 overflow-auto bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-copper/20">
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
