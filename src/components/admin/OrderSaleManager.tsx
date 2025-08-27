
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from '@/hooks/useSupabaseOrders';
import { useSupabaseSales } from '@/hooks/useSupabaseSales';
import { Check, Loader2 } from 'lucide-react';

interface OrderSaleManagerProps {
  order: OrderData;
  onOrderUpdated: () => void;
}

export const OrderSaleManager: React.FC<OrderSaleManagerProps> = ({ 
  order, 
  onOrderUpdated 
}) => {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { createSale } = useSupabaseSales();

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
        category: item.category || '',
        brand: item.brand || ''
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
        const { error: orderError } = await supabase
          .from('pedidos')
          .update({ 
            status: 'finalizado', // Different from 'confirmado' to indicate completion
            total_confirmado: order.total_estimado, // Set confirmed total
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

  // Only show button for confirmed orders that haven't been converted to sales yet
  if (order.status !== 'confirmado') return null;

  return (
    <Button
      onClick={createSaleFromOrder}
      disabled={creating}
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
  );
};

export default OrderSaleManager;
