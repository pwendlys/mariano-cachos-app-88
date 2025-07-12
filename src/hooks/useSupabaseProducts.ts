
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseProduct {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  preco: number;
  preco_custo?: number;
  estoque: number;
  estoque_minimo: number;
  descricao?: string;
  imagem?: string;
  codigo_barras?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos do estoque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ estoque: newStock })
        .eq('id', productId);

      if (error) throw error;

      // Registrar movimentação de estoque
      await supabase
        .from('movimentacao_estoque')
        .insert({
          produto_id: productId,
          tipo: 'entrada',
          quantidade: newStock,
          motivo: 'Ajuste de estoque',
        });

      await fetchProducts();
      toast({
        title: "Estoque atualizado!",
        description: "O estoque do produto foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: "Erro ao atualizar estoque",
        description: "Não foi possível atualizar o estoque do produto.",
        variant: "destructive",
      });
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    updateProductStock,
  };
};
