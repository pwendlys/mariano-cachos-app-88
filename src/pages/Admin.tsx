
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("agendamentos");
  const { toast } = useToast()

  return (
    <div className="px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gradient-gold">Painel Administrativo</h1>
        <Button variant="outline" size="sm" onClick={() => {
          localStorage.removeItem('supabase.auth.token');
          navigate('/login');
          toast({
            title: "Logout realizado",
            description: "Você será redirecionado para a página de login.",
          })
        }}>
          Sair
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="flex flex-wrap gap-1 bg-salon-purple/20 p-2 rounded-xl mb-6 min-w-max">
            <TabsTrigger value="agendamentos" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="servicos" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Serviços
            </TabsTrigger>
            <TabsTrigger value="produtos" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="profissionais" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Profissionais
            </TabsTrigger>
            <TabsTrigger value="caixa" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Caixa
            </TabsTrigger>
            <TabsTrigger value="comissoes" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Comissões
            </TabsTrigger>
            <TabsTrigger value="cobrancas" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Cobranças
            </TabsTrigger>
            <TabsTrigger value="banner" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Banner
            </TabsTrigger>
            <TabsTrigger value="galeria" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper whitespace-nowrap">
              Galeria
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="agendamentos" className="mt-6">
          <AppointmentManagement />
        </TabsContent>

        <TabsContent value="servicos" className="mt-6">
          <ServiceManagement />
        </TabsContent>

        <TabsContent value="produtos" className="mt-6">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="profissionais" className="mt-6">
          <ProfessionalManagement />
        </TabsContent>

        <TabsContent value="caixa" className="mt-6">
          <CashFlowManagement />
        </TabsContent>

        <TabsContent value="comissoes" className="mt-6">
          <CommissionManagement />
        </TabsContent>

        <TabsContent value="cobrancas" className="mt-6">
          <DebtCollectionManagement />
        </TabsContent>

        <TabsContent value="banner" className="mt-6">
          <BannerManagement />
        </TabsContent>

        <TabsContent value="galeria" className="mt-6">
          <GalleryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
