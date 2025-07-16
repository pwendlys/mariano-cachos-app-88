
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSharedCart, CartItem } from './useSharedCart';
import { useSupabaseProducts } from './useSupabaseProducts';

export const useRealtimeCart = () => {
  const cartMethods = useSharedCart();
  const { products } = useSupabaseProducts();
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  // Validate cart items against current stock
  const validateCartStock = useCallback(() => {
    const warnings: string[] = [];
    
    cartMethods.cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (product) {
        if (product.stock === 0) {
          warnings.push(`${cartItem.name} está fora de estoque`);
        } else if (product.stock < cartItem.quantity) {
          warnings.push(`${cartItem.name}: apenas ${product.stock} unidades disponíveis`);
        }
      }
    });
    
    setStockWarnings(warnings);
  }, [cartMethods.cart, products]);

  // Listen to product changes that might affect cart
  useEffect(() => {
    const channel = supabase
      .channel('cart-stock-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'produtos'
        },
        (payload) => {
          console.log('Stock update affecting cart:', payload);
          validateCartStock();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [validateCartStock]);

  // Validate stock whenever cart or products change
  useEffect(() => {
    validateCartStock();
  }, [validateCartStock]);

  // Enhanced add to cart with stock validation
  const addToCartWithValidation = (product: Omit<CartItem, 'quantity'>, quantity: number) => {
    const currentProduct = products.find(p => p.id === product.id);
    
    if (!currentProduct) {
      throw new Error('Produto não encontrado');
    }
    
    if (currentProduct.stock === 0) {
      throw new Error('Produto fora de estoque');
    }
    
    const existingItem = cartMethods.cart.find(item => item.id === product.id);
    const totalQuantityWanted = (existingItem?.quantity || 0) + quantity;
    
    if (totalQuantityWanted > currentProduct.stock) {
      throw new Error(`Apenas ${currentProduct.stock} unidades disponíveis`);
    }
    
    cartMethods.addToCart(product, quantity);
  };

  return {
    ...cartMethods,
    addToCartWithValidation,
    stockWarnings,
    clearStockWarnings: () => setStockWarnings([])
  };
};
