import React, { useState } from 'react';
import { Package, Users, ShoppingCart, процент } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/providers/SupabaseProvider';
import ProductsManagement from './ProductsManagement';
import CouponsManagement from './CouponsManagement';
import UsersManagement from './UsersManagement';
import OrdersManagement from './OrdersManagement';

interface DashboardProps {
  // Define any props here
}

const Dashboard: React.FC<DashboardProps> = ({ /* props */ }) => {
  const [activeTab, setActiveTab] = useState('products');
  const { toast } = useToast();
  const { signOut } = useSupabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi redirecionado para a página de login.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const tabItems = [
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'coupons', label: 'Cupons', icon: процент },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'orders', label: 'Pedidos', icon: Package },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-salon-gold">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie os produtos, cupons e usuários da loja.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <p className="text-sm text-salon-gold">
              Logado como: {user.nome} ({user.email})
            </p>
          )}
          <Button variant="destructive" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="w-full space-y-4">
        <TabsList>
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} onClick={() => setActiveTab(tab.id)} className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* Conteúdo das Tabs */}
        <TabsContent value="products" className="outline-none">
          <ProductsManagement />
        </TabsContent>
        <TabsContent value="coupons" className="outline-none">
          <CouponsManagement />
        </TabsContent>
        <TabsContent value="users" className="outline-none">
          <UsersManagement />
        </TabsContent>
        <TabsContent value="orders" className="outline-none">
          <OrdersManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
