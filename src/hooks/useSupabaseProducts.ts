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
  tipo_produto: 'ecommerce' | 'interno';
  em_destaque: boolean;
  ordem_destaque: number;
  created_at?: string;
  updated_at?: string;
}

// Interface compatible with the original Product from useSharedProducts
export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  image?: string;
  costPrice?: number;
  type: 'ecommerce' | 'interno';
  featured?: boolean;
  featuredOrder?: number;
}

// Helper functions to convert between interfaces
const convertToProduct = (supabaseProduct: SupabaseProduct): Product => ({
  id: supabaseProduct.id,
  name: supabaseProduct.nome,
  brand: supabaseProduct.marca,
  description: supabaseProduct.descricao || '',
  price: supabaseProduct.preco,
  stock: supabaseProduct.estoque,
  minStock: supabaseProduct.estoque_minimo,
  category: supabaseProduct.categoria,
  image: supabaseProduct.imagem,
  costPrice: supabaseProduct.preco_custo,
  type: supabaseProduct.tipo_produto,
  featured: supabaseProduct.em_destaque,
  featuredOrder: supabaseProduct.ordem_destaque,
});

const convertFromProduct = (product: Product): Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at' | 'ativo'> => ({
  nome: product.name,
  marca: product.brand,
  descricao: product.description,
  preco: product.price,
  estoque: product.stock,
  estoque_minimo: product.minStock,
  categoria: product.category,
  imagem: product.image,
  preco_custo: product.costPrice,
  codigo_barras: '',
  tipo_produto: product.type,
  em_destaque: product.featured || false,
  ordem_destaque: product.featuredOrder || 0,
});

export const useSupabaseProducts = (productType?: 'ecommerce' | 'interno' | 'all') => {
  const [supabaseProducts, setSupabaseProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Convert Supabase products to the expected Product interface
  const products: Product[] = supabaseProducts.map(convertToProduct);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      // Filter by product type if specified
      if (productType && productType !== 'all') {
        query = query.eq('tipo_produto', productType);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type cast the data to ensure tipo_produto is properly typed
      const typedData = (data || []).map(item => ({
        ...item,
        tipo_produto: item.tipo_produto as 'ecommerce' | 'interno'
      }));
      
      setSupabaseProducts(typedData);
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
  }, [productType]);

  const addProduct = async (product: Product) => {
    try {
      const productData = convertFromProduct(product);
      const { error } = await supabase
        .from('produtos')
        .insert([{ ...productData, ativo: true }]);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível adicionar o produto.",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (productId: string, updatedProduct: Product) => {
    try {
      const productData = convertFromProduct(updatedProduct);
      const { error } = await supabase
        .from('produtos')
        .update(productData)
        .eq('id', productId);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', productId);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast({
        title: "Erro ao deletar produto",
        description: "Não foi possível deletar o produto.",
        variant: "destructive",
      });
    }
  };

  const updateProductStock = async (productId: string, newStock: number, newCostPrice?: number) => {
    try {
      const updateData: any = { estoque: newStock };
      if (newCostPrice !== undefined) {
        updateData.preco_custo = newCostPrice;
      }

      const { error } = await supabase
        .from('produtos')
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;

      // Registrar movimentação de estoque
      const product = supabaseProducts.find(p => p.id === productId);
      if (product) {
        const quantityDiff = newStock - product.estoque;
        if (quantityDiff !== 0) {
          await supabase
            .from('movimentacao_estoque')
            .insert({
              produto_id: productId,
              tipo: quantityDiff > 0 ? 'entrada' : 'saida',
              quantidade: Math.abs(quantityDiff),
              motivo: quantityDiff > 0 ? 'Entrada de estoque' : 'Ajuste de estoque',
            });
        }
      }

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
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
  };
};
