
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, Package, DollarSign, Receipt, UserCheck, Image as ImageIcon, Settings, ShoppingCart } from 'lucide-react';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import ProfessionalsTabManager from '@/components/ProfessionalsTabManager';
import AppointmentsTab from '@/components/AppointmentsTab';
import CashFlowManagement from '@/components/CashFlowManagement';
import GalleryManagement from '@/components/GalleryManagement';
import BannerManagement from '@/components/BannerManagement';
import CustomerProfileManagement from '@/components/CustomerProfileManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';

interface DashboardProps {
  onEditService?: (serviceId: string) => void;
}

const Dashboard = ({ onEditService }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Gerencie todos os aspectos do seu salão
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9 mb-6 bg-salon-dark/50 border border-salon-gold/20">
          <TabsTrigger 
            value="appointments" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <Settings className="h-4 w-4 mr-2" />
            Serviços
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger 
            value="professionals" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Profissionais
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger 
            value="cashflow" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Fluxo
          </TabsTrigger>
          <TabsTrigger 
            value="customers" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger 
            value="gallery" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Galeria
          </TabsTrigger>
          <TabsTrigger 
            value="banners" 
            className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-gold"
          >
            <Settings className="h-4 w-4 mr-2" />
            Banners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <AppointmentsTab />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServiceManagement />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="professionals" className="space-y-4">
          <ProfessionalsTabManager />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrdersManagement />
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <CashFlowManagement />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomerProfileManagement />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <GalleryManagement />
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <BannerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
