
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import UserProfileHeader from '@/components/UserProfileHeader';
import UserAppointments from '@/components/profile/UserAppointments';
import ProductsForSale from '@/components/profile/ProductsForSale';
import { useUserPurchases } from '@/hooks/useUserPurchases';
import { useUserOrders } from '@/hooks/useUserOrders';
import { Package, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

const Profile = () => {
  const { purchases, loading: purchasesLoading, formatDate } = useUserPurchases();
  const { 
    orders, 
    loading: ordersLoading, 
    getStatusLabel: getOrderStatusLabel, 
    getStatusColor: getOrderStatusColor 
  } = useUserOrders();

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aguardando_confirmacao':
        return <Clock size={14} />;
      case 'confirmado':
        return <CheckCircle size={14} />;
      case 'cancelado':
        return <XCircle size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const getPurchaseStatusLabel = (status: string) => {
    switch (status) {
      case 'finalizada': return 'Finalizada';
      case 'pendente': return 'Pendente';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getPurchaseStatusColor = (status: string) => {
    switch (status) {
      case 'finalizada': return 'bg-green-500/20 text-green-400';
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelada': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
              <TabsTrigger value="produtos">Produtos à Venda</TabsTrigger>
              <TabsTrigger value="compras">Compras</TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="mt-6">
              <UserProfileHeader />
            </TabsContent>

            <TabsContent value="agendamentos" className="mt-6">
              <UserAppointments />
            </TabsContent>

            <TabsContent value="produtos" className="mt-6">
              <ProductsForSale />
            </TabsContent>

            <TabsContent value="compras" className="mt-6">
              <div className="space-y-8">
                {/* Pedidos em Andamento */}
                <Card className="glass-card border-salon-gold/20">
                  <CardHeader>
                    <CardTitle className="text-salon-gold flex items-center gap-2">
                      <Package size={20} />
                      Pedidos em Andamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-salon-gold border-t-transparent rounded-full" />
                      </div>
                    ) : orders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Você não possui pedidos em andamento.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="glass-card border-salon-gold/10 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-salon-gold">
                                  Pedido #{order.id?.slice(-8)}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(order.created_at || '')}
                                </p>
                              </div>
                              <Badge 
                                className={`${getOrderStatusColor(order.status)} flex items-center gap-1`}
                              >
                                {getStatusIcon(order.status)}
                                {getOrderStatusLabel(order.status)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Itens: </span>
                                {order.itens.length} produto(s)
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Pagamento: </span>
                                <span className="capitalize">{order.metodo_pagamento}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Entrega: </span>
                                <span className="capitalize">{order.modalidade_entrega}</span>
                              </div>
                              <div className="text-sm font-medium text-salon-gold">
                                Total: R$ {(order.total_confirmado || order.total_estimado).toFixed(2)}
                              </div>
                            </div>

                            {/* Detalhes dos itens */}
                            <div className="mt-3 pt-3 border-t border-salon-gold/20">
                              <h5 className="text-sm font-medium mb-2">Itens do pedido:</h5>
                              <div className="space-y-1">
                                {order.itens.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Compras Finalizadas */}
                <Card className="glass-card border-salon-gold/20">
                  <CardHeader>
                    <CardTitle className="text-salon-gold flex items-center gap-2">
                      <ShoppingBag size={20} />
                      Compras Finalizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {purchasesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-salon-gold border-t-transparent rounded-full" />
                      </div>
                    ) : purchases.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Você ainda não fez nenhuma compra.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {purchases.map((purchase) => (
                          <div key={purchase.id} className="glass-card border-salon-gold/10 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-salon-gold">
                                  Compra #{purchase.id.slice(-8)}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(purchase.data_venda)}
                                </p>
                              </div>
                              <Badge className={getPurchaseStatusColor(purchase.status)}>
                                {getPurchaseStatusLabel(purchase.status)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Itens: </span>
                                {purchase.itens?.length || 0} produto(s)
                              </div>
                              
                              <div className="flex justify-between items-center pt-2 border-t border-salon-gold/20">
                                <span className="font-medium">Total:</span>
                                <span className="font-bold text-salon-gold">
                                  R$ {purchase.total_final?.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
