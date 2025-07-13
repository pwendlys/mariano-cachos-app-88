
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Scissors, Package, Calendar, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import ProfessionalManagement from '@/components/ProfessionalManagement';
import TimeBlockingManagement from '@/components/TimeBlockingManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import DebtCollectionManagement from '@/components/DebtCollectionManagement';
import BannerManagement from '@/components/BannerManagement';
import AppointmentManagement from '@/components/AppointmentManagement';
import { useIsMobile } from '@/hooks/use-mobile';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  const isMobile = useIsMobile();

  const tabs = [
    { value: 'services', label: 'Serviços', shortLabel: 'Serv', icon: Scissors },
    { value: 'products', label: 'Produtos', shortLabel: 'Prod', icon: Package },
    { value: 'appointments', label: 'Agendamentos', shortLabel: 'Agend', icon: CheckCircle },
    { value: 'professionals', label: 'Profissionais', shortLabel: 'Prof', icon: Users },
    { value: 'timeblocking', label: 'Horários', shortLabel: 'Hora', icon: Calendar },
    { value: 'cashflow', label: 'Fluxo de Caixa', shortLabel: 'Caixa', icon: DollarSign },
    { value: 'debts', label: 'Cobranças', shortLabel: 'Cobr', icon: AlertTriangle },
    { value: 'banners', label: 'Banners', shortLabel: 'Ban', icon: Settings },
  ];

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark to-black p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-salon-gold mb-1 sm:mb-2">
              {isMobile ? 'Admin' : 'Painel Administrativo'}
            </h1>
            <p className="text-xs sm:text-sm text-salon-copper">
              {isMobile ? 'Gerencie seu salão' : 'Gerencie todos os aspectos do seu salão'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`
              grid w-full mb-4 sm:mb-6 glass-card p-1 sm:p-2
              ${isMobile ? 'grid-cols-4 gap-1' : 'grid-cols-4 md:grid-cols-8'}
              ${isMobile ? 'h-auto' : ''}
            `}>
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className={`
                    data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold
                    ${isMobile ? 'flex-col p-1.5 h-auto min-h-[60px] text-[10px]' : 'flex-row p-2'}
                    transition-all duration-200
                  `}
                >
                  <tab.icon className={`${isMobile ? 'w-4 h-4 mb-1' : 'w-4 h-4 mr-2'}`} />
                  <span className={isMobile ? 'leading-tight text-center' : 'hidden md:inline'}>
                    {isMobile ? tab.shortLabel : tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="space-y-4">
              <TabsContent value="services" className="mt-0">
                <ServiceManagement />
              </TabsContent>

              <TabsContent value="products" className="mt-0">
                <ProductManagement />
              </TabsContent>

              <TabsContent value="appointments" className="mt-0">
                <AppointmentManagement />
              </TabsContent>

              <TabsContent value="professionals" className="mt-0">
                <ProfessionalManagement />
              </TabsContent>

              <TabsContent value="timeblocking" className="mt-0">
                <TimeBlockingManagement />
              </TabsContent>

              <TabsContent value="cashflow" className="mt-0">
                <CashFlowManagement />
              </TabsContent>

              <TabsContent value="debts" className="mt-0">
                <DebtCollectionManagement />
              </TabsContent>

              <TabsContent value="banners" className="mt-0">
                <BannerManagement />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Admin;
