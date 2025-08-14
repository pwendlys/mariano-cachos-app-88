import React, { useState } from 'react';
import { User, Calendar, ShoppingBag, Star, Package, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useUserAppointments } from '@/hooks/useUserAppointments';
import { useUserPurchases } from '@/hooks/useUserPurchases';
import AvatarUpload from '@/components/AvatarUpload';

const Profile = () => {
  const { toast } = useToast();
  const { user, logout, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useSupabaseProducts();
  const { appointments, loading: appointmentsLoading, getStatusLabel, getStatusColor, formatDate } = useUserAppointments();
  const { purchases, loading: purchasesLoading, formatDate: formatPurchaseDate } = useUserPurchases();
  const [activeTab, setActiveTab] = useState('info');

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    updateUserAvatar(newAvatarUrl);
    toast({
      title: "Foto atualizada!",
      description: "Sua foto de perfil foi atualizada com sucesso."
    });
  };

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        {user && (
          <AvatarUpload
            currentAvatarUrl={user.avatar_url}
            userId={user.id}
            userName={user.nome}
            onAvatarUpdate={handleAvatarUpdate}
          />
        )}
        <h1 className="text-2xl font-bold text-salon-gold mb-2 font-playfair mt-4">
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
            
            {appointmentsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando agendamentos...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Você ainda não possui agendamentos.</p>
                <Button 
                  onClick={() => navigate('/agendamento')}
                  className="mt-4 bg-salon-gold hover:bg-salon-copper text-salon-dark"
                >
                  Fazer Agendamento
                </Button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment.id} className="glass-card border-salon-gold/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{appointment.servico.nome}</h3>
                        <p className="text-sm text-salon-copper capitalize">
                          {appointment.servico.categoria} • {appointment.servico.duracao} min
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(appointment.data)} às {appointment.horario}
                        </p>
                        {appointment.valor && (
                          <p className="text-salon-gold font-medium mt-1">
                            R$ {appointment.valor.toFixed(2)}
                          </p>
                        )}
                        {appointment.observacoes && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Obs:</strong> {appointment.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                        {appointment.status_pagamento && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            appointment.status_pagamento === 'pago' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {appointment.status_pagamento === 'pago' ? 'Pago' : 'Pag. Pendente'}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-salon-gold mb-4">Produtos a Venda</h2>
            
            {productsLoading ? (
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
                        {product.image && (
                          <div className="flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{product.name}</h3>
                          <p className="text-sm text-salon-copper">{product.brand}</p>
                          <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-salon-gold font-bold text-lg">
                              R$ {product.price.toFixed(2)}
                            </span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              product.stock > 0
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {product.stock > 0 ? `${product.stock} disponível` : 'Esgotado'}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            disabled={product.stock === 0}
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
            
            {purchasesLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando compras...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Você ainda não realizou compras.</p>
                <Button 
                  onClick={() => navigate('/loja')}
                  className="mt-4 bg-salon-gold hover:bg-salon-copper text-salon-dark"
                >
                  Ir às Compras
                </Button>
              </div>
            ) : (
              purchases.map((purchase) => (
                <Card key={purchase.id} className="glass-card border-salon-gold/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          Compra #{purchase.id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Realizada em {formatPurchaseDate(purchase.data_venda)}
                        </p>
                        <p className="text-salon-gold font-bold text-lg">
                          R$ {purchase.total_final.toFixed(2)}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Entregue
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-salon-copper">Produtos:</h4>
                      {purchase.itens.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-salon-dark/30 rounded-lg p-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-salon-gold/20 to-salon-copper/20 rounded-lg overflow-hidden flex-shrink-0">
                            {item.produto.imagem ? (
                              <img 
                                src={item.produto.imagem} 
                                alt={item.produto.nome}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-lg">🧴</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h5 className="font-medium text-white text-sm">{item.produto.nome}</h5>
                            <p className="text-xs text-salon-copper">{item.produto.marca}</p>
                            <p className="text-xs text-muted-foreground">
                              Qtd: {item.quantidade} • R$ {item.preco_unitario.toFixed(2)} cada
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-salon-gold font-medium">
                              R$ {item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
