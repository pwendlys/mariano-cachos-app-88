
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

    // Set up real-time subscription for product changes
    const channel = supabase
      .channel('produtos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos'
        },
        (payload) => {
          console.log('Produto alterado em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newProduct = payload.new as SupabaseProduct;
            if (newProduct.ativo) {
              setProducts(prev => [...prev, newProduct].sort((a, b) => a.nome.localeCompare(b.nome)));
              toast({
                title: "Novo produto adicionado! 🎉",
                description: `${newProduct.nome} foi adicionado ao catálogo.`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedProduct = payload.new as SupabaseProduct;
            setProducts(prev => {
              const filtered = prev.filter(p => p.id !== updatedProduct.id);
              if (updatedProduct.ativo) {
                return [...filtered, updatedProduct].sort((a, b) => a.nome.localeCompare(b.nome));
              }
              return filtered;
            });
            
            if (updatedProduct.ativo) {
              toast({
                title: "Produto atualizado! ✨",
                description: `${updatedProduct.nome} foi atualizado.`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedProduct = payload.old as SupabaseProduct;
            setProducts(prev => prev.filter(p => p.id !== deletedProduct.id));
            toast({
              title: "Produto removido",
              description: `${deletedProduct.nome} foi removido do catálogo.`,
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
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
