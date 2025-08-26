import React, { useState, useEffect } from 'react';
import { Package, Eye, Check, X, MapPin, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseOrders, OrderData } from '@/hooks/useSupabaseOrders';
import OrderSaleManager from '@/components/admin/OrderSaleManager';

const OrdersManagement = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Campos para admin definir
  const [freteValor, setFreteValor] = useState<string>('');
  const [jurosPercentual, setJurosPercentual] = useState<string>('');
  
  const { getPendingOrders, updateOrderForAdmin } = useSupabaseOrders();
  const { toast } = useToast();

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      const pendingOrders = await getPendingOrders();
      
      // Get both pending confirmation and confirmed orders for admin management
      const { data: confirmedOrders, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('status', 'confirmado')
        .order('created_at', { ascending: false });

      let allOrders = pendingOrders;
      
      if (!error && confirmedOrders) {
        const formattedConfirmedOrders = confirmedOrders.map((order) => ({
          ...order,
          status: order.status as 'aguardando_confirmacao' | 'confirmado' | 'cancelado',
          metodo_pagamento: order.metodo_pagamento as 'pix' | 'cartao' | 'dinheiro',
          modalidade_entrega: order.modalidade_entrega as 'retirada' | 'entrega',
          endereco_entrega: order.endereco_entrega ? JSON.parse(order.endereco_entrega as string) : undefined,
          itens: JSON.parse(order.itens as string)
        }));
        
        allOrders = [...pendingOrders, ...formattedConfirmedOrders];
      }
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Não foi possível carregar os pedidos pendentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setFreteValor(order.frete_valor?.toString() || '');
    setJurosPercentual(order.juros_percentual?.toString() || '');
    setShowDetailsModal(true);
  };

  const calculateTotalConfirmado = (order: OrderData): number => {
    const frete = parseFloat(freteValor) || 0;
    const jurosPerc = parseFloat(jurosPercentual) || 0;
    const jurosValor = (order.subtotal - order.desconto) * (jurosPerc / 100);
    
    return (order.subtotal - order.desconto) + frete + jurosValor;
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      
      const frete = parseFloat(freteValor) || 0;
      const jurosPerc = parseFloat(jurosPercentual) || 0;
      const jurosValor = jurosPerc > 0 ? ((selectedOrder.subtotal - selectedOrder.desconto) * (jurosPerc / 100)) : 0;
      const totalConfirmado = calculateTotalConfirmado(selectedOrder);

      const updates = {
        frete_valor: frete > 0 ? frete : null,
        juros_percentual: jurosPerc > 0 ? jurosPerc : null,
        juros_valor: jurosValor > 0 ? jurosValor : null,
        total_confirmado: totalConfirmado,
        status: 'confirmado' as const
      };

      const success = await updateOrderForAdmin(selectedOrder.id!, updates);
      
      if (success) {
        setShowDetailsModal(false);
        loadPendingOrders(); // Recarrega a lista
        toast({
          title: "Pedido confirmado! ✅",
          description: "O cliente será notificado sobre a confirmação do pedido.",
        });
      }
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      toast({
        title: "Erro ao confirmar pedido",
        description: "Não foi possível confirmar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      
      const success = await updateOrderForAdmin(selectedOrder.id!, {
        status: 'cancelado' as const
      });
      
      if (success) {
        setShowDetailsModal(false);
        loadPendingOrders(); // Recarrega a lista
        toast({
          title: "Pedido cancelado",
          description: "O pedido foi cancelado e o cliente será notificado.",
        });
      }
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      toast({
        title: "Erro ao cancelar pedido",
        description: "Não foi possível cancelar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'pix': return '💳';
      case 'cartao': return '💰';
      case 'dinheiro': return '💵';
      default: return '💳';
    }
  };

  const getDeliveryModeIcon = (mode: string) => {
    return mode === 'entrega' ? '🚚' : '🏪';
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-salon-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="text-salon-gold" size={24} />
        <h2 className="text-xl font-bold text-salon-gold">Gestão de Pedidos</h2>
        <Badge variant="secondary" className="bg-salon-gold/20 text-salon-gold">
          {orders.length}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum pedido para gerenciar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="glass-card border-salon-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-salon-gold font-medium">
                        Pedido #{order.id?.slice(-8)}
                      </span>
                      <Badge className={
                        order.status === 'aguardando_confirmacao' 
                          ? "bg-yellow-500/20 text-yellow-400"
                          : order.status === 'confirmado'
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }>
                        {order.status === 'aguardando_confirmacao' ? 'Aguardando confirmação' : 
                         order.status === 'confirmado' ? 'Confirmado - Pronto para venda' :
                         'Cancelado'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getPaymentMethodIcon(order.metodo_pagamento)}
                        {order.metodo_pagamento.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        {getDeliveryModeIcon(order.modalidade_entrega)}
                        {order.modalidade_entrega === 'entrega' ? 'Entrega' : 'Retirada'}
                      </span>
                      <span className="flex items-center gap-1">
                        📦 {order.itens.length} {order.itens.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    
                    <div className="text-lg font-bold text-salon-gold">
                      {order.status === 'confirmado' && order.total_confirmado 
                        ? `Total confirmado: R$ ${order.total_confirmado.toFixed(2)}`
                        : `Total estimado: R$ ${order.total_estimado.toFixed(2)}`
                      }
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at!).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleViewOrder(order)}
                      variant="outline"
                      size="sm"
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      <Eye size={16} className="mr-1" />
                      Ver Detalhes
                    </Button>
                    
                    <OrderSaleManager 
                      order={order}
                      onOrderUpdated={loadPendingOrders}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="glass-card border-salon-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">
              Detalhes do Pedido #{selectedOrder?.id?.slice(-8)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Informações do Cliente */}
              <div className="space-y-2">
                <h3 className="font-semibold text-salon-gold">Cliente</h3>
                <p className="text-white">{selectedOrder.user_email}</p>
              </div>

              {/* Informações de Pagamento e Entrega */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-salon-gold">Pagamento</h3>
                  <p className="text-white flex items-center gap-2">
                    {getPaymentMethodIcon(selectedOrder.metodo_pagamento)}
                    {selectedOrder.metodo_pagamento.toUpperCase()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-salon-gold">Entrega</h3>
                  <p className="text-white flex items-center gap-2">
                    {getDeliveryModeIcon(selectedOrder.modalidade_entrega)}
                    {selectedOrder.modalidade_entrega === 'entrega' ? 'Entrega' : 'Retirada'}
                  </p>
                </div>
              </div>

              {/* Endereço de Entrega */}
              {selectedOrder.modalidade_entrega === 'entrega' && selectedOrder.endereco_entrega && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-salon-gold">Endereço de Entrega</h3>
                  <div className="bg-salon-dark/50 p-3 rounded-lg text-white text-sm">
                    <p>{selectedOrder.endereco_entrega.rua}, {selectedOrder.endereco_entrega.numero}</p>
                    {selectedOrder.endereco_entrega.complemento && (
                      <p>{selectedOrder.endereco_entrega.complemento}</p>
                    )}
                    <p>{selectedOrder.endereco_entrega.bairro} - {selectedOrder.endereco_entrega.cidade}/{selectedOrder.endereco_entrega.uf}</p>
                    <p>CEP: {selectedOrder.endereco_entrega.cep}</p>
                  </div>
                </div>
              )}

              {/* Itens do Pedido */}
              <div className="space-y-2">
                <h3 className="font-semibold text-salon-gold">Itens</h3>
                <div className="space-y-2">
                  {selectedOrder.itens.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-salon-dark/50 p-3 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                        <p className="text-sm text-salon-copper">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-salon-gold font-bold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {selectedOrder.observacoes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-salon-gold">Observações</h3>
                  <p className="text-white bg-salon-dark/50 p-3 rounded-lg">
                    {selectedOrder.observacoes}
                  </p>
                </div>
              )}

              {/* Configurações do Admin */}
              <div className="space-y-4 border-t border-salon-gold/20 pt-4">
                <h3 className="font-semibold text-salon-gold">Configurações do Pedido</h3>
                
                {selectedOrder.modalidade_entrega === 'entrega' && (
                  <div className="space-y-2">
                    <Label htmlFor="frete" className="text-salon-gold">Valor do Frete (R$)</Label>
                    <Input
                      id="frete"
                      type="number"
                      step="0.01"
                      value={freteValor}
                      onChange={(e) => setFreteValor(e.target.value)}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {selectedOrder.metodo_pagamento === 'cartao' && (
                  <div className="space-y-2">
                    <Label htmlFor="juros" className="text-salon-gold">Juros (%)</Label>
                    <Input
                      id="juros"
                      type="number"
                      step="0.01"
                      value={jurosPercentual}
                      onChange={(e) => setJurosPercentual(e.target.value)}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {/* Resumo dos Valores */}
              <div className="space-y-2 border-t border-salon-gold/20 pt-4">
                <h3 className="font-semibold text-salon-gold">Resumo</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-white">
                    <span>Subtotal:</span>
                    <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.desconto > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Desconto:</span>
                      <span>- R$ {selectedOrder.desconto.toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(freteValor) > 0 && (
                    <div className="flex justify-between text-white">
                      <span>Frete:</span>
                      <span>R$ {parseFloat(freteValor).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(jurosPercentual) > 0 && (
                    <div className="flex justify-between text-white">
                      <span>Juros ({jurosPercentual}%):</span>
                      <span>R$ {((selectedOrder.subtotal - selectedOrder.desconto) * (parseFloat(jurosPercentual) / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-salon-gold font-bold text-base border-t border-salon-gold/20 pt-2">
                    <span>Total Final:</span>
                    <span>R$ {calculateTotalConfirmado(selectedOrder).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleConfirmOrder}
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {updating ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Check size={16} className="mr-2" />
                  )}
                  Confirmar Pedido
                </Button>
                
                <Button
                  onClick={handleRejectOrder}
                  disabled={updating}
                  variant="destructive"
                  className="flex-1"
                >
                  {updating ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <X size={16} className="mr-2" />
                  )}
                  Cancelar Pedido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
