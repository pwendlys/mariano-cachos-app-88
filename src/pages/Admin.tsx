
import React, { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import AppointmentManagement from '@/components/AppointmentManagement';
import ServiceManagement from '@/components/ServiceManagement';
import ProductManagement from '@/components/ProductManagement';
import ProfessionalManagement from '@/components/ProfessionalManagement';
import CustomerProfileManagement from '@/components/CustomerProfileManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import CommissionManagement from '@/components/CommissionManagement';
import DebtCollectionManagement from '@/components/DebtCollectionManagement';
import TimeBlockingManagement from '@/components/TimeBlockingManagement';
import { ReviewManagement } from '@/components/ReviewManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Admin() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="pt-20 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Painel Administrativo
            </h1>
            
            <Tabs defaultValue="appointments" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 xl:grid-cols-9">
                <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="professionals">Profissionais</TabsTrigger>
                <TabsTrigger value="customers">Clientes</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="commissions">Comissões</TabsTrigger>
                <TabsTrigger value="collections">Cobrança</TabsTrigger>
                <TabsTrigger value="blocking">Bloqueios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments">
                <AppointmentManagement />
              </TabsContent>
              
              <TabsContent value="services">
                <ServiceManagement />
              </TabsContent>
              
              <TabsContent value="products">
                <ProductManagement />
              </TabsContent>
              
              <TabsContent value="professionals">
                <ProfessionalManagement />
              </TabsContent>
              
              <TabsContent value="customers">
                <CustomerProfileManagement />
              </TabsContent>
              
              <TabsContent value="reviews">
                <ReviewManagement />
              </TabsContent>
              
              <TabsContent value="cashflow">
                <CashFlowManagement />
              </TabsContent>
              
              <TabsContent value="commissions">
                <CommissionManagement />
              </TabsContent>
              
              <TabsContent value="collections">
                <DebtCollectionManagement />
              </TabsContent>
              
              <TabsContent value="blocking">
                <TimeBlockingManagement />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}
