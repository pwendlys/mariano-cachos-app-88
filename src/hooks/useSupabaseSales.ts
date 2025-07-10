
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/hooks/useSharedCart';

export interface SaleData {
  cliente_id?: string;
  total: number;
  desconto?: number;
  total_final: number;
  forma_pagamento?: string;
  observacoes?: string;
  items: {
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
  }[];
}

export const useSupabaseSales = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createSale = async (cartItems: CartItem[], paymentMethod?: string, discount: number = 0) => {
    try {
      setLoading(true);
      
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const finalTotal = total - discount;

      // Criar a venda
      const { data: sale, error: saleError } = await supabase
        .from('vendas')
        .insert({
          total,
          desconto: discount,
          total_final: finalTotal,
          forma_pagamento: paymentMethod,
          status: 'pendente'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Criar os itens da venda
      const saleItems = cartItems.map(item => ({
        venda_id: sale.id,
        produto_id: item.id,
        quantidade: item.quantity,
        preco_unitario: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('itens_venda')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Finalizar a venda (isso dispara o trigger para atualizar estoque)
      const { error: updateError } = await supabase
        .from('vendas')
        .update({ status: 'finalizada' })
        .eq('id', sale.id);

      if (updateError) throw updateError;

      toast({
        title: "Venda finalizada! 🎉",
        description: `Venda de R$ ${finalTotal.toFixed(2)} realizada com sucesso.`,
      });

      return sale;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast({
        title: "Erro ao finalizar venda",
        description: "Não foi possível processar a venda. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSale,
    loading,
  };
};
