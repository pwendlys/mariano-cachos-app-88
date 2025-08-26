
import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Calendar, 
  Users, 
  Settings, 
  Scissors,
  Store,
  FileImage,
  Receipt,
  TrendingUp,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductManagement from '@/components/ProductManagement';
import ServiceManagement from '@/components/ServiceManagement';
import AppointmentsTab from '@/components/AppointmentsTab';
import CustomerProfileManagement from '@/components/CustomerProfileManagement';
import ProfessionalsTabManager from '@/components/ProfessionalsTabManager';
import CashFlowManagement from '@/components/CashFlowManagement';
import CommissionManagement from '@/components/CommissionManagement';
import BannerManagement from '@/components/BannerManagement';
import GalleryManagement from '@/components/GalleryManagement';
import DebtCollectionsDashboard from '@/components/DebtCollectionsDashboard';
import OrdersManagement from '@/components/admin/OrdersManagement';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-dark p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os aspectos do seu negócio
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-12 w-full bg-salon-dark/50 border border-salon-gold/20">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <BarChart3 size={16} className="mr-1" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <Package size={16} className="mr-1" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <Scissors size={16} className="mr-1" />
              <span className="hidden sm:inline">Serviços</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <Calendar size={16} className="mr-1" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <Users size={16} className="mr-1" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="professionals" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <Settings size={16} className="mr-1" />
              <span className="hidden sm:inline">Profissionais</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <ClipboardList size={16} className="mr-1" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cash-flow" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <TrendingUp size={16} className="mr-1" />
              <span className="hidden sm:inline">Fluxo Caixa</span>
            </TabsTrigger>
            <TabsTrigger 
              value="commissions" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <CreditCard size={16} className="mr-1" />
              <span className="hidden sm:inline">Comissões</span>
            </TabsTrigger>
            <TabsTrigger 
              value="banners" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <Store size={16} className="mr-1" />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <FileImage size={16} className="mr-1" />
              <span className="hidden sm:inline">Galeria</span>
            </TabsTrigger>
            <TabsTrigger 
              value="collections" 
              className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold text-xs"
            >
              <AlertTriangle size={16} className="mr-1" />
              <span className="hidden sm:inline">Cobranças</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card border-salon-gold/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Agendamentos Hoje
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-salon-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-salon-gold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 desde ontem
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-salon-gold/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Vendas do Mês
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-salon-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-salon-gold">R$ 8.450</div>
                  <p className="text-xs text-muted-foreground">
                    +12% desde o mês passado
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-salon-gold/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Produtos Ativos
                  </CardTitle>
                  <Package className="h-4 w-4 text-salon-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-salon-gold">247</div>
                  <p className="text-xs text-muted-foreground">
                    15 com estoque baixo
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-salon-gold/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Clientes Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-salon-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-salon-gold">1.234</div>
                  <p className="text-xs text-muted-foreground">
                    +89 este mês
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsTab />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerProfileManagement />
          </TabsContent>

          <TabsContent value="professionals">
            <ProfessionalsTabManager />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="cash-flow">
            <CashFlowManagement />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionManagement />
          </TabsContent>

          <TabsContent value="banners">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManagement />
          </TabsContent>

          <TabsContent value="collections">
            <DebtCollectionsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
