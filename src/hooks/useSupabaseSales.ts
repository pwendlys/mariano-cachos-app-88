
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CartItem } from '@/hooks/useSharedCart';

export interface SaleData {
  cliente_id?: string;
  profissional_id?: string;
  total: number;
  desconto?: number;
  total_final: number;
  forma_pagamento?: string;
  observacoes?: string;
  cupom_id?: string;
  chave_pix?: string;
  chave_pix_abacate?: string;
  qr_code_data?: string;
  transaction_id?: string;
  status_pagamento?: string;
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
  const { user } = useAuth();

  const findOrCreateCliente = async (userEmail: string, userName: string): Promise<string | null> => {
    try {
      console.log('Buscando cliente para email:', userEmail);
      
      // Primeiro, tenta encontrar o cliente existente
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

  const createSale = async (
    cartItems: CartItem[], 
    paymentMethod?: string, 
    discount: number = 0,
    couponId?: string,
    professionalId?: string,
    pixData?: {
      chave_pix?: string;
      chave_pix_abacate?: string;
      qr_code_data?: string;
      transaction_id?: string;
    }
  ) => {
    try {
      setLoading(true);
      console.log('Iniciando criação de venda:', { 
        cartItems, 
        paymentMethod, 
        discount, 
        couponId, 
        professionalId,
        pixData,
        user: user?.email
      });

      // Verificar se o usuário está logado
      if (!user || !user.email) {
        console.error('Usuário não está logado');
        toast({
          title: "Erro de autenticação",
          description: "É necessário estar logado para finalizar a compra.",
          variant: "destructive",
        });
        throw new Error('Usuário não autenticado');
      }

      // Buscar ou criar cliente
      const clienteId = await findOrCreateCliente(user.email, user.nome);
      
      if (!clienteId) {
        console.error('Não foi possível obter cliente_id');
        toast({
          title: "Erro no cliente",
          description: "Não foi possível processar os dados do cliente.",
          variant: "destructive",
        });
        throw new Error('Erro ao processar dados do cliente');
      }

      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const finalTotal = total - discount;

      // Criar a venda com cliente_id
      const { data: sale, error: saleError } = await supabase
        .from('vendas')
        .insert({
          cliente_id: clienteId, // Agora sempre incluímos o cliente_id
          total,
          desconto: discount,
          total_final: finalTotal,
          forma_pagamento: paymentMethod,
          cupom_id: couponId,
          profissional_id: professionalId,
          status: 'pendente',
          status_pagamento: 'pendente',
          chave_pix: pixData?.chave_pix,
          chave_pix_abacate: pixData?.chave_pix_abacate,
          qr_code_data: pixData?.qr_code_data,
          transaction_id: pixData?.transaction_id
        })
        .select()
        .single();

      if (saleError) {
        console.error('Erro ao criar venda:', saleError);
        toast({
          title: "Erro na venda",
          description: `Não foi possível processar a venda: ${saleError.message}`,
          variant: "destructive",
        });
        throw saleError;
      }

      console.log('Venda criada com sucesso:', sale);

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

      if (itemsError) {
        console.error('Erro ao criar itens da venda:', itemsError);
        toast({
          title: "Erro nos itens",
          description: "Erro ao registrar itens da venda.",
          variant: "destructive",
        });
        throw itemsError;
      }

      console.log('Itens da venda criados:', saleItems);

      // Atualizar o estoque dos produtos
      for (const item of cartItems) {
        // Buscar o produto atual para verificar estoque
        const { data: produto, error: produtoError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.id)
          .single();

        if (produtoError) {
          console.error('Erro ao buscar produto:', produtoError);
          continue;
        }

        const novoEstoque = produto.estoque - item.quantity;
        
        // Atualizar estoque do produto
        const { error: updateError } = await supabase
          .from('produtos')
          .update({ estoque: Math.max(0, novoEstoque) })
          .eq('id', item.id);

        if (updateError) {
          console.error('Erro ao atualizar estoque:', updateError);
        } else {
          console.log(`Estoque atualizado para produto ${item.id}: ${produto.estoque} -> ${novoEstoque}`);
        }

        // Registrar movimentação de estoque
        const { error: movError } = await supabase
          .from('movimentacao_estoque')
          .insert({
            produto_id: item.id,
            tipo: 'saida',
            quantidade: item.quantity,
            motivo: `Venda ${sale.id}`,
          });

        if (movError) {
          console.error('Erro ao registrar movimentação:', movError);
        }
      }

      // Se um cupom foi usado, incrementar contador de uso
      if (couponId) {
        // Buscar o cupom atual
        const { data: currentCoupon, error: fetchError } = await supabase
          .from('cupons')
          .select('usos_realizados')
          .eq('id', couponId)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar cupom:', fetchError);
        } else {
          // Atualizar o contador de uso
          const { error: couponError } = await supabase
            .from('cupons')
            .update({ 
              usos_realizados: (currentCoupon.usos_realizados || 0) + 1
            })
            .eq('id', couponId);

          if (couponError) {
            console.error('Erro ao atualizar uso do cupom:', couponError);
          } else {
            console.log('Uso do cupom incrementado');
          }
        }
      }

      // Finalizar a venda
      const { error: updateError } = await supabase
        .from('vendas')
        .update({ status: 'finalizada' })
        .eq('id', sale.id);

      if (updateError) {
        console.error('Erro ao finalizar venda:', updateError);
        toast({
          title: "Erro na finalização",
          description: "Erro ao finalizar a venda.",
          variant: "destructive",
        });
        throw updateError;
      }

      console.log('Venda finalizada com sucesso');

      toast({
        title: "Compra finalizada! 🎉",
        description: `Compra de R$ ${finalTotal.toFixed(2)} realizada com sucesso. ${professionalId ? 'Comissão calculada automaticamente.' : ''}`,
      });

      return sale;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast({
        title: "Erro ao finalizar compra",
        description: "Não foi possível processar a compra. Tente novamente.",
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
