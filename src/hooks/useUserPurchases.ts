
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserPurchase {
  id: string;
  data_venda: string;
  total_final: number;
  status: string;
  itens: {
    produto: {
      nome: string;
      marca: string;
      imagem?: string;
    };
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
  }[];
}

export const useUserPurchases = () => {
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserPurchases = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      // First get the client ID based on user email
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', user.email)
        .single();

      if (clientError || !clientData) {
        console.log('No client found for this user');
        setPurchases([]);
        setLoading(false);
        return;
      }

      // Then fetch purchases for this client with product details
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          id,
          data_venda,
          total_final,
          status,
          itens_venda(
            quantidade,
            preco_unitario,
            subtotal,
            produto:produtos(nome, marca, imagem)
          )
        `)
        .eq('cliente_id', clientData.id)
        .eq('status', 'finalizada')
        .order('data_venda', { ascending: false });

      if (error) throw error;

      // Transform data to match interface
      const transformedPurchases = data?.map(purchase => ({
        id: purchase.id,
        data_venda: purchase.data_venda,
        total_final: purchase.total_final,
        status: purchase.status,
        itens: purchase.itens_venda?.map(item => ({
          produto: {
            nome: item.produto?.nome || 'Produto não encontrado',
            marca: item.produto?.marca || 'Marca não informada',
            imagem: item.produto?.imagem
          },
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal
        })) || []
      })) || [];

      setPurchases(transformedPurchases);
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas compras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPurchases();
  }, [user?.email]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return {
    purchases,
    loading,
    formatDate,
    refetch: fetchUserPurchases
  };
};
