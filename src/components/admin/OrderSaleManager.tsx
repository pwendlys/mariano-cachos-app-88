
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from '@/hooks/useSupabaseOrders';
import { useSupabaseSales } from '@/hooks/useSupabaseSales';
import { Check } from 'lucide-react';

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
        image: '', // Not needed for sale creation
        category: '', // Not needed for sale creation
        brand: '' // Not needed for sale creation
      }));

      // Calculate discount from order
      const discount = order.desconto || 0;

      // Use the existing createSale hook which handles:
      // - Client creation/lookup
      // - Sale record creation
      // - Items insertion
      // - Stock updates
      // - Cash flow registration
      // - Commission calculations
      // - Notifications
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
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (orderError) {
          console.error('Erro ao atualizar status do pedido:', orderError);
          // Don't throw here as the sale was created successfully
        }

        toast({
          title: "Venda criada com sucesso! 🎉",
          description: `Pedido #${order.id?.slice(-8)} foi convertido em venda e registrado no fluxo de caixa.`,
        });

        onOrderUpdated();
      }

    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast({
        title: "Erro ao criar venda",
        description: "Não foi possível converter o pedido em venda. Tente novamente.",
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
        <div className="animate-spin w-4 h-4 border-2 border-salon-dark border-t-transparent rounded-full mr-2" />
      ) : (
        <Check size={16} className="mr-2" />
      )}
      {creating ? 'Processando...' : 'Finalizar Venda'}
    </Button>
  );
};

export default OrderSaleManager;
