import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Agendamentos from '@/components/Agendamentos';
import Servicos from '@/components/Servicos';
import Produtos from '@/components/Produtos';
import Profissionais from '@/components/Profissionais';
import Caixa from '@/components/Caixa';
import Comissoes from '@/components/Comissoes';
import Cobrancas from '@/components/Cobrancas';
import BannerSettings from '@/components/BannerSettings';
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
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1 bg-salon-purple/20 p-1 rounded-xl mb-6">
          <TabsTrigger value="agendamentos" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="servicos" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Serviços
          </TabsTrigger>
          <TabsTrigger value="produtos" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Produtos
          </TabsTrigger>
          <TabsTrigger value="profissionais" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Profissionais
          </TabsTrigger>
          <TabsTrigger value="caixa" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Caixa
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Comissões
          </TabsTrigger>
          <TabsTrigger value="cobrancas" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Cobranças
          </TabsTrigger>
          <TabsTrigger value="banner" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Banner
          </TabsTrigger>
          <TabsTrigger value="galeria" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper">
            Galeria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agendamentos" className="mt-6">
          <Agendamentos />
        </TabsContent>

        <TabsContent value="servicos" className="mt-6">
          <Servicos />
        </TabsContent>

        <TabsContent value="produtos" className="mt-6">
          <Produtos />
        </TabsContent>

        <TabsContent value="profissionais" className="mt-6">
          <Profissionais />
        </TabsContent>

        <TabsContent value="caixa" className="mt-6">
          <Caixa />
        </TabsContent>

        <TabsContent value="comissoes" className="mt-6">
          <Comissoes />
        </TabsContent>

        <TabsContent value="cobrancas" className="mt-6">
          <Cobrancas />
        </TabsContent>

        <TabsContent value="banner" className="mt-6">
          <BannerSettings />
        </TabsContent>

        <TabsContent value="galeria" className="mt-6">
          <GalleryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
