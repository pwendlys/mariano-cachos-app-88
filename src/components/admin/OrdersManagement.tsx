import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseOrders, OrderData } from '@/hooks/useSupabaseOrders';
import { OrderSaleManager } from './OrderSaleManager';
import { Package, MapPin, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [freight, setFreight] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const { toast } = useToast();
  const { updateOrderForAdmin } = useSupabaseOrders();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: ordersData, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: OrderData[] = (ordersData || []).map((order) => ({
        ...order,
        status: order.status as 'aguardando_confirmacao' | 'confirmado' | 'cancelado',
        metodo_pagamento: order.metodo_pagamento as 'pix' | 'cartao' | 'dinheiro',
        modalidade_entrega: order.modalidade_entrega as 'retirada' | 'entrega',
        endereco_entrega: order.endereco_entrega ? JSON.parse(order.endereco_entrega as string) : undefined,
        itens: JSON.parse(order.itens as string)
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aguardando_confirmacao':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400"><Clock size={12} className="mr-1" />Aguardando</Badge>;
      case 'confirmado':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400"><CheckCircle size={12} className="mr-1" />Confirmado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive"><XCircle size={12} className="mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const freightValue = parseFloat(freight) || 0;
    const interestRateValue = parseFloat(interestRate) || 0;
    const interestAmount = order.metodo_pagamento === 'cartao' && interestRateValue > 0 
      ? (order.subtotal - order.desconto) * (interestRateValue / 100) 
      : 0;

    const totalConfirmed = order.subtotal - order.desconto + freightValue + interestAmount;

    const success = await updateOrderForAdmin(orderId, {
      frete_valor: freightValue > 0 ? freightValue : undefined,
      juros_percentual: interestRateValue > 0 ? interestRateValue : undefined,
      juros_valor: interestAmount > 0 ? interestAmount : undefined,
      total_confirmado: totalConfirmed,
      status: 'confirmado'
    });

    if (success) {
      setEditingOrder(null);
      setFreight('');
      setInterestRate('');
      fetchOrders();
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const success = await updateOrderForAdmin(orderId, {
      status: 'cancelado'
    });

    if (success) {
      fetchOrders();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin w-8 h-8 border-2 border-salon-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="text-salon-gold" size={24} />
        <h2 className="text-2xl font-bold text-salon-gold">Gestão de Pedidos</h2>
      </div>

      {orders.length === 0 ? (
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Nenhum pedido encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="glass-card border-salon-gold/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-salon-gold">
                      Pedido #{order.id?.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.user_email} • {new Date(order.created_at || '').toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-salon-gold mb-2">Itens do Pedido</h4>
                  <div className="space-y-2">
                    {order.itens.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 glass-card border-salon-gold/10 rounded">
                        <span>{item.name}</span>
                        <span className="text-salon-gold">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment and Delivery Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-salon-gold" />
                    <span className="capitalize">{order.metodo_pagamento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-salon-gold" />
                    <span className="capitalize">{order.modalidade_entrega}</span>
                  </div>
                </div>

                {/* Address for delivery */}
                {order.modalidade_entrega === 'entrega' && order.endereco_entrega && (
                  <div>
                    <h5 className="font-medium text-salon-gold mb-2">Endereço de Entrega</h5>
                    <p className="text-sm">
                      {order.endereco_entrega.rua}, {order.endereco_entrega.numero}
                      {order.endereco_entrega.complemento && `, ${order.endereco_entrega.complemento}`}
                      <br />
                      {order.endereco_entrega.bairro}, {order.endereco_entrega.cidade} - {order.endereco_entrega.uf}
                      <br />
                      CEP: {order.endereco_entrega.cep}
                    </p>
                  </div>
                )}

                {/* Observations */}
                {order.observacoes && (
                  <div>
                    <h5 className="font-medium text-salon-gold mb-2">Observações</h5>
                    <p className="text-sm">{order.observacoes}</p>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 border-t border-salon-gold/20 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.desconto > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Desconto:</span>
                      <span>- R$ {order.desconto.toFixed(2)}</span>
                    </div>
                  )}
                  {order.frete_valor && (
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>R$ {order.frete_valor.toFixed(2)}</span>
                    </div>
                  )}
                  {order.juros_valor && (
                    <div className="flex justify-between text-yellow-400">
                      <span>Juros ({order.juros_percentual}%):</span>
                      <span>R$ {order.juros_valor.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-salon-gold border-t border-salon-gold/20 pt-2">
                    <span>Total:</span>
                    <span>R$ {(order.total_confirmado || order.total_estimado).toFixed(2)}</span>
                  </div>
                </div>

                {/* Admin Actions */}
                {order.status === 'aguardando_confirmacao' && (
                  <div className="space-y-4 border-t border-salon-gold/20 pt-4">
                    {editingOrder === order.id ? (
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          {order.modalidade_entrega === 'entrega' && (
                            <div>
                              <Label htmlFor="freight">Valor do Frete (R$)</Label>
                              <Input
                                id="freight"
                                type="number"
                                step="0.01"
                                value={freight}
                                onChange={(e) => setFreight(e.target.value)}
                                className="glass-card border-salon-gold/30 bg-transparent"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                          {order.metodo_pagamento === 'cartao' && (
                            <div>
                              <Label htmlFor="interest">Juros (%)</Label>
                              <Input
                                id="interest"
                                type="number"
                                step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="glass-card border-salon-gold/30 bg-transparent"
                                placeholder="0.0"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleConfirmOrder(order.id!)}
                            className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
                          >
                            Confirmar Pedido
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingOrder(null);
                              setFreight('');
                              setInterestRate('');
                            }}
                            className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingOrder(order.id!);
                            setFreight(order.frete_valor?.toString() || '');
                            setInterestRate(order.juros_percentual?.toString() || '');
                          }}
                          className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
                        >
                          Confirmar Pedido
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelOrder(order.id!)}
                        >
                          Cancelar Pedido
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Sale Creation for Confirmed Orders */}
                {order.status === 'confirmado' && (
                  <div className="border-t border-salon-gold/20 pt-4">
                    <OrderSaleManager 
                      order={order} 
                      onOrderUpdated={fetchOrders}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
