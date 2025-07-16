
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseProducts, Product } from './useSupabaseProducts';

export const useRealtimeProducts = () => {
  const { products, loading, ...productMethods } = useSupabaseProducts();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('produtos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos'
        },
        (payload) => {
          console.log('Product realtime update:', payload);
          // Refresh products when changes occur
          productMethods.fetchProducts();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('Realtime connection status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    products,
    loading,
    isConnected,
    ...productMethods
  };
};
