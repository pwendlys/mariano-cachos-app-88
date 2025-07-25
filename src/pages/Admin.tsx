
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Users, Calendar, DollarSign, Package, TrendingUp, Receipt, UserCheck } from 'lucide-react';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import AppointmentManagement from '@/components/AppointmentManagement';
import ProfessionalManagement from '@/components/ProfessionalManagement';
import CommissionManagement from '@/components/CommissionManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import BannerManagement from '@/components/BannerManagement';
import ClientList from '@/components/ClientList';
import DebtCollectionManagement from '@/components/DebtCollectionManagement';
import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');

  if (!user || user.tipo !== 'admin') {
    return (
      <div className="min-h-screen bg-salon-dark flex items-center justify-center">
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-salon-gold mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-salon-dark p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os aspectos do seu salão
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 lg:grid-cols-9 glass-card border-salon-gold/20">
            <TabsTrigger value="appointments" className="flex items-center gap-2 text-xs md:text-sm">
              <Calendar size={16} />
              <span className="hidden sm:inline">Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2 text-xs md:text-sm">
              <UserCheck size={16} />
              <span className="hidden sm:inline">Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 text-xs md:text-sm">
              <Package size={16} />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center gap-2 text-xs md:text-sm">
              <Users size={16} />
              <span className="hidden sm:inline">Profissionais</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2 text-xs md:text-sm">
              <Receipt size={16} />
              <span className="hidden sm:inline">Comissões</span>
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2 text-xs md:text-sm">
              <TrendingUp size={16} />
              <span className="hidden sm:inline">Fluxo de Caixa</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 text-xs md:text-sm">
              <Users size={16} />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="debt" className="flex items-center gap-2 text-xs md:text-sm">
              <DollarSign size={16} />
              <span className="hidden sm:inline">Cobranças</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2 text-xs md:text-sm">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <AppointmentManagement />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="professionals" className="space-y-6">
            <ProfessionalManagement />
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <CommissionManagement />
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <CashFlowManagement />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientList />
          </TabsContent>

          <TabsContent value="debt" className="space-y-6">
            <DebtCollectionManagement />
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <BannerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
