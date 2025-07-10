
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Scissors, Package, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import ProfessionalManagement from '@/components/ProfessionalManagement';
import TimeBlockingManagement from '@/components/TimeBlockingManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import DebtCollectionManagement from '@/components/DebtCollectionManagement';
import BannerManagement from '@/components/BannerManagement';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark to-black p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-salon-gold mb-2">Painel Administrativo</h1>
            <p className="text-salon-copper">Gerencie todos os aspectos do seu salão</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 glass-card mb-6">
              <TabsTrigger value="services" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
                <Scissors className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Serviços</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
                <Package className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="professionals" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Profissionais</span>
              </TabsTrigger>
              <TabsTrigger value="timeblocking" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Horários</span>
              </TabsTrigger>
              <TabsTrigger value="cashflow" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Fluxo de Caixa</span>
              </TabsTrigger>
              <TabsTrigger value="debts" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Cobranças</span>
              </TabsTrigger>
              <TabsTrigger value="banners" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Banners</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <ServiceManagement />
            </TabsContent>

            <TabsContent value="products">
              <ProductManagement />
            </TabsContent>

            <TabsContent value="professionals">
              <ProfessionalManagement />
            </TabsContent>

            <TabsContent value="timeblocking">
              <TimeBlockingManagement />
            </TabsContent>

            <TabsContent value="cashflow">
              <CashFlowManagement />
            </TabsContent>

            <TabsContent value="debts">
              <DebtCollectionManagement />
            </TabsContent>

            <TabsContent value="banners">
              <BannerManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Admin;
