
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from '@/hooks/useSupabaseOrders';
import { useSupabaseSales } from '@/hooks/useSupabaseSales';
import { Check, Loader2, DollarSign } from 'lucide-react';

interface OrderSaleManagerProps {
  order: OrderData;
  onOrderUpdated: () => void;
}

export const OrderSaleManager: React.FC<OrderSaleManagerProps> = ({ 
  order, 
  onOrderUpdated 
}) => {
  const [creating, setCreating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const { toast } = useToast();
  const { createSale } = useSupabaseSales();

  const registerInCashFlow = async () => {
    try {
      setRegistering(true);
      
      console.log('Registrando pedido no fluxo de caixa:', {
        orderId: order.id,
        total: order.total_confirmado || order.total_estimado
      });

      const totalValue = order.total_confirmado || order.total_estimado;

      // Registrar apenas uma entrada no fluxo de caixa com o valor total do pedido
      const { error } = await supabase
        .from('fluxo_caixa')
        .insert({
          data: new Date().toISOString().split('T')[0], // Data atual
          tipo: 'entrada',
          categoria: 'Produtos',
          descricao: `Pedido #${order.id?.slice(-8)} - Registro manual no caixa`,
          valor: totalValue,
          origem_tipo: 'pedido',
          origem_id: order.id,
          metadata: {
            pedido_id: order.id,
            tipo_registro: 'manual',
            valor_original: totalValue
          }
        });

      if (error) {
        console.error('Erro ao registrar no fluxo de caixa:', error);
        toast({
          title: "Erro ao registrar no caixa",
          description: "Não foi possível registrar o pedido no fluxo de caixa.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registrado no caixa! 💰",
        description: `Pedido #${order.id?.slice(-8)} foi registrado no fluxo de caixa com valor de R$ ${totalValue.toFixed(2)}.`,
      });

    } catch (error) {
      console.error('Erro ao registrar no fluxo de caixa:', error);
      toast({
        title: "Erro ao registrar no caixa",
        description: "Não foi possível registrar o pedido no fluxo de caixa.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const createSaleFromOrder = async () => {
    try {
      setCreating(true);
      
      // Convert order items to cart items format expected by useSupabaseSales
      const cartItems = order.itens.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        brand: item.brand // This property exists in order items but not in CartItem interface
      }));

      // Calculate discount from order
      const discount = order.desconto || 0;

      console.log('Converting order to sale:', {
        orderId: order.id,
        cartItems,
        paymentMethod: order.metodo_pagamento,
        discount
      });

      // Use the existing createSale hook which now handles:
      // - Client creation/lookup with proper RLS
      // - Sale record creation with triggers for cash flow
      // - Items insertion
      // - Stock updates
      // - Commission calculations (via trigger)
      // - Notifications (via trigger)
      const sale = await createSale(
        cartItems,
        order.metodo_pagamento,
        discount
      );

      if (sale) {
        // Update order status to indicate it has been converted to a sale
        // Do not overwrite total_confirmado, only update status
        const { error: orderError } = await supabase
          .from('pedidos')
          .update({ 
            status: 'finalizado', // Different from 'confirmado' to indicate completion
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (orderError) {
          console.error('Erro ao atualizar status do pedido:', orderError);
          toast({
            title: "Aviso",
            description: "Venda criada com sucesso, mas houve problema ao atualizar o pedido.",
            variant: "default",
          });
        } else {
          toast({
            title: "Venda criada com sucesso! 🎉",
            description: `Pedido #${order.id?.slice(-8)} foi convertido em venda e registrado no sistema.`,
          });
        }

        onOrderUpdated();
      }

    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast({
        title: "Erro ao criar venda",
        description: "Não foi possível converter o pedido em venda. Verifique os logs para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Only show buttons for confirmed orders that haven't been converted to sales yet
  if (order.status !== 'confirmado') return null;

  return (
    <div className="flex gap-2">
      <Button
        onClick={createSaleFromOrder}
        disabled={creating || registering}
        size="sm"
        className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium"
      >
        {creating ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <Check size={16} className="mr-2" />
        )}
        {creating ? 'Processando...' : 'Finalizar Venda'}
      </Button>
      
      <Button
        onClick={registerInCashFlow}
        disabled={creating || registering}
        size="sm"
        variant="outline"
        className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 font-medium"
      >
        {registering ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <DollarSign size={16} className="mr-2" />
        )}
        {registering ? 'Registrando...' : 'Registrar no Caixa'}
      </Button>
    </div>
  );
};

export default OrderSaleManager;
