
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OrderData } from '@/hooks/useSupabaseOrders';

export const useUserOrders = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserOrders = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const { data: ordersData, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos do usuário:', error);
        return;
      }

      // Convert database responses to OrderData format
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user?.email]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aguardando_confirmacao': return 'Aguardando Confirmação';
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando_confirmacao': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmado': return 'bg-green-500/20 text-green-400';
      case 'cancelado': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return {
    orders,
    loading,
    fetchUserOrders,
    getStatusLabel,
    getStatusColor
  };
};
