
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from '@/hooks/useSupabaseOrders';
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

  const createSaleFromOrder = async () => {
    try {
      setCreating(true);
      
      // Calculate final total (already calculated in order)
      const totalFinal = order.total_confirmado || order.total_estimado;

      // Create the sale record
      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .insert({
          cliente_id: order.cliente_id,
          total: order.subtotal,
          desconto: order.desconto,
          total_final: totalFinal,
          data_venda: new Date().toISOString(),
          status: 'finalizada',
          forma_pagamento: order.metodo_pagamento
        })
        .select()
        .single();

      if (vendaError) throw vendaError;

      // Create sale items
      const itensVenda = order.itens.map(item => ({
        venda_id: venda.id,
        produto_id: item.id,
        quantidade: item.quantity,
        preco_unitario: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itensError } = await supabase
        .from('itens_venda')
        .insert(itensVenda);

      if (itensError) throw itensError;

      // Update product stock directly
      for (const item of order.itens) {
        const { data: produto, error: fetchError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.id)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar produto:', fetchError);
          continue;
        }

        const novoEstoque = Math.max(0, produto.estoque - item.quantity);

        const { error: updateError } = await supabase
          .from('produtos')
          .update({ estoque: novoEstoque })
          .eq('id', item.id);

        if (updateError) {
          console.error('Erro ao atualizar estoque:', updateError);
          // Continue even if stock update fails
        }
      }

      // Update order status to confirmado
      const { error: orderError } = await supabase
        .from('pedidos')
        .update({ 
          status: 'confirmado',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast({
        title: "Venda criada com sucesso! 🎉",
        description: `Pedido #${order.id?.slice(-8)} foi convertido em venda e registrado no fluxo de caixa.`,
      });

      onOrderUpdated();

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
