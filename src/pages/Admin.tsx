
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/admin/AppSidebar';
import Dashboard from '@/components/admin/Dashboard';
import AppointmentManagement from '@/components/AppointmentManagement';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import ProfessionalManagement from '@/components/ProfessionalManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import CommissionManagement from '@/components/CommissionManagement';
import DebtCollectionManagement from '@/components/DebtCollectionManagement';
import BannerManagement from '@/components/BannerManagement';
import GalleryManagement from '@/components/GalleryManagement';

const Admin = () => {
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'agendamentos':
        return <AppointmentManagement />;
      case 'servicos':
        return <ServiceManagement />;
      case 'produtos':
        return <ProductManagement />;
      case 'profissionais':
        return <ProfessionalManagement />;
      case 'caixa':
        return <CashFlowManagement />;
      case 'comissoes':
        return <CommissionManagement />;
      case 'cobrancas':
        return <DebtCollectionManagement />;
      case 'banner':
        return <BannerManagement />;
      case 'galeria':
        return <GalleryManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-salon-dark via-salon-purple to-salon-dark">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-salon-gold/20 px-4">
            <SidebarTrigger className="-ml-1 text-salon-gold hover:bg-salon-gold/10" />
            <div className="h-6 w-px bg-salon-gold/20 mx-2" />
            <div className="flex items-center gap-2 text-sm text-salon-copper">
              <span>Painel Administrativo</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
