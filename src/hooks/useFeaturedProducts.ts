import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from './useSupabaseProducts';

interface FeaturedSupabaseProduct {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  preco: number;
  estoque: number;
  descricao?: string;
  imagem?: string;
  imagem_banner?: string;
  ativo: boolean;
  tipo_produto: 'ecommerce' | 'interno';
  em_destaque: boolean;
  ordem_destaque: number;
}

const convertToProduct = (product: FeaturedSupabaseProduct): Product => ({
  id: product.id,
  name: product.nome,
  brand: product.marca,
  description: product.descricao || '',
  price: product.preco,
  stock: product.estoque,
  minStock: 0,
  category: product.categoria,
  image: product.imagem,
  bannerImage: product.imagem_banner,
  type: product.tipo_produto,
});

export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .eq('em_destaque', true)
        .eq('tipo_produto', 'ecommerce')
        .gt('estoque', 0)
        .order('ordem_destaque', { ascending: true });

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        tipo_produto: item.tipo_produto as 'ecommerce' | 'interno'
      }));
      
      setFeaturedProducts(typedData.map(convertToProduct));
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      toast({
        title: "Erro ao carregar produtos em destaque",
        description: "Não foi possível carregar os produtos em destaque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();

    // Realtime subscription para produtos em destaque
    const channel = supabase
      .channel('featured-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos',
          filter: 'em_destaque=eq.true'
        },
        () => {
          console.log('Featured products updated');
          fetchFeaturedProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    featuredProducts,
    loading,
    refetch: fetchFeaturedProducts
  };
};
