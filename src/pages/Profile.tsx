
import React, { useState } from 'react';
import { User, Calendar, ShoppingBag, Heart, Settings, LogOut, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';

const Profile = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { products, loading } = useSupabaseProducts();
  const [activeTab, setActiveTab] = useState('info');

  // Mock data for appointments and purchases
  const appointments = [
    {
      id: '1',
      service: 'Corte + Escova',
      date: '2024-01-15',
      time: '14:30',
      status: 'Confirmado'
    },
    {
      id: '2',
      service: 'Hidratação Profunda',
      date: '2024-01-08',
      time: '16:00',
      status: 'Concluído'
    }
  ];

  const purchases = [
    {
      id: '1',
      product: 'Shampoo Hidratante',
      date: '2024-01-10',
      value: 89.90,
      status: 'Entregue'
    },
    {
      id: '2',
      product: 'Máscara Capilar',
      date: '2024-01-05',
      value: 156.90,
      status: 'Entregue'
    }
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado!",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/auth');
  };

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-salon-gold to-salon-copper mx-auto mb-4 flex items-center justify-center">
          <User size={32} className="text-salon-dark" />
        </div>
        <h1 className="text-2xl font-bold text-salon-gold mb-2 font-playfair">
          {user?.nome || 'Usuário'}
        </h1>
        <p className="text-muted-foreground">
          {user?.email || 'email@exemplo.com'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card mb-6">
          <TabsTrigger value="info" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Agendamentos</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
            <Package className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Produtos a Venda</span>
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
            <ShoppingBag className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Compras</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="space-y-4">
            <Card className="glass-card border-salon-gold/20">
              <CardHeader>
                <CardTitle className="text-salon-gold flex items-center gap-2">
                  <User size={20} />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-salon-copper">Nome</label>
                  <p className="text-white">{user?.nome || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-salon-copper">E-mail</label>
                  <p className="text-white">{user?.email || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-salon-copper">WhatsApp</label>
                  <p className="text-white">{user?.whatsapp || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-salon-copper">Tipo de Conta</label>
                  <p className="text-white capitalize">{user?.tipo || 'Cliente'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-salon-gold/20">
              <CardHeader>
                <CardTitle className="text-salon-gold flex items-center gap-2">
                  <Star size={20} />
                  Programa de Fidelidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-salon-gold/20 mx-auto mb-4 flex items-center justify-center">
                    <Star size={24} className="text-salon-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-salon-gold mb-2">Em Breve!</h3>
                  <p className="text-muted-foreground">
                    Estamos preparando um programa de fidelidade especial para você.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
              >
                <Settings className="mr-2" size={16} />
                Configurações
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10 h-12"
              >
                <LogOut className="mr-2" size={16} />
                Sair
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-salon-gold mb-4">Meus Agendamentos</h2>
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="glass-card border-salon-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{appointment.service}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date} às {appointment.time}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'Confirmado' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-salon-gold mb-4">Produtos a Venda</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="glass-card border-salon-gold/20">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {product.imagem && (
                          <div className="flex-shrink-0">
                            <img 
                              src={product.imagem} 
                              alt={product.nome}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{product.nome}</h3>
                          <p className="text-sm text-salon-copper">{product.marca}</p>
                          <p className="text-sm text-muted-foreground mt-1">{product.descricao}</p>
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-salon-gold font-bold text-lg">
                              R$ {product.preco.toFixed(2)}
                            </span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              product.estoque > 0
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {product.estoque > 0 ? `${product.estoque} disponível` : 'Esgotado'}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {product.categoria}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            disabled={product.estoque === 0}
                            className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-10"
                            onClick={() => navigate('/loja')}
                          >
                            Ver na Loja
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-salon-gold mb-4">Minhas Compras</h2>
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="glass-card border-salon-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{purchase.product}</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprado em {purchase.date}
                      </p>
                      <p className="text-salon-gold font-medium">
                        R$ {purchase.value.toFixed(2)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {purchase.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
