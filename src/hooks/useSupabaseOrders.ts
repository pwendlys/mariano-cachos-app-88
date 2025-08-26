
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CartItem } from '@/hooks/useSharedCart';

export interface Address {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface OrderData {
  id?: string;
  cliente_id?: string;
  user_email: string;
  status: 'aguardando_confirmacao' | 'confirmado' | 'cancelado';
  metodo_pagamento: 'pix' | 'cartao' | 'dinheiro';
  modalidade_entrega: 'retirada' | 'entrega';
  endereco_entrega?: Address;
  observacoes?: string;
  subtotal: number;
  desconto: number;
  frete_valor?: number;
  juros_percentual?: number;
  juros_valor?: number;
  total_estimado: number;
  total_confirmado?: number;
  cupom_id?: string;
  itens: CartItem[];
  created_at?: string;
  updated_at?: string;
}

export const useSupabaseOrders = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const findOrCreateCliente = async (userEmail: string, userName: string): Promise<string | null> => {
    try {
      console.log('Buscando cliente para email:', userEmail);
      
      const { data: existingCliente, error: searchError } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Erro ao buscar cliente:', searchError);
        throw searchError;
      }

      if (existingCliente) {
        console.log('Cliente existente encontrado:', existingCliente.id);
        return existingCliente.id;
      }

      // Se não encontrou, cria um novo cliente
      console.log('Criando novo cliente para:', userEmail);
      const { data: newCliente, error: createError } = await supabase
        .from('clientes')
        .insert({
          email: userEmail,
          nome: userName,
          telefone: user?.whatsapp || 'Não informado'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Erro ao criar cliente:', createError);
        throw createError;
      }

      console.log('Novo cliente criado:', newCliente.id);
      return newCliente.id;
    } catch (error) {
      console.error('Erro em findOrCreateCliente:', error);
      return null;
    }
  };

  const createOrder = async (orderData: Omit<OrderData, 'id' | 'created_at' | 'updated_at'>): Promise<OrderData | null> => {
    try {
      setLoading(true);
      console.log('Criando pedido:', orderData);

      if (!user || !user.email) {
        toast({
          title: "Erro de autenticação",
          description: "É necessário estar logado para criar um pedido.",
          variant: "destructive",
        });
        return null;
      }

      // Buscar ou criar cliente
      const clienteId = await findOrCreateCliente(user.email, user.nome);
      
      if (!clienteId) {
        toast({
          title: "Erro no cliente",
          description: "Não foi possível processar os dados do cliente.",
          variant: "destructive",
        });
        return null;
      }

      const { data: order, error } = await supabase
        .from('pedidos')
        .insert({
          ...orderData,
          cliente_id: clienteId,
          user_email: user.email
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pedido:', error);
        toast({
          title: "Erro ao criar pedido",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      console.log('Pedido criado com sucesso:', order);
      return order;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar o pedido. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPendingOrders = async (): Promise<OrderData[]> => {
    try {
      const { data: orders, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('status', 'aguardando_confirmacao')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos pendentes:', error);
        return [];
      }

      return orders || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos pendentes:', error);
      return [];
    }
  };

  const updateOrderForAdmin = async (
    orderId: string, 
    updates: Partial<Pick<OrderData, 'frete_valor' | 'juros_percentual' | 'juros_valor' | 'total_confirmado' | 'status'>>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        console.error('Erro ao atualizar pedido:', error);
        toast({
          title: "Erro ao atualizar pedido",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Pedido atualizado",
        description: "As informações do pedido foram atualizadas com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível atualizar o pedido.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createOrder,
    getPendingOrders,
    updateOrderForAdmin,
    loading
  };
};
