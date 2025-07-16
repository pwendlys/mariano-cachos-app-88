
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeStockUpdate = () => {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('stock-alerts')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'produtos'
        },
        (payload) => {
          console.log('Stock update detected:', payload);
          
          if (payload.new && payload.old) {
            const newStock = payload.new.estoque;
            const oldStock = payload.old.estoque;
            const productName = payload.new.nome;
            const minStock = payload.new.estoque_minimo;
            
            // Alert when stock becomes low
            if (oldStock > minStock && newStock <= minStock && newStock > 0) {
              toast({
                title: "⚠️ Estoque Baixo",
                description: `${productName} tem apenas ${newStock} unidades restantes`,
                variant: "destructive",
              });
            }
            
            // Alert when stock becomes zero
            if (oldStock > 0 && newStock === 0) {
              toast({
                title: "🚨 Produto Esgotado",
                description: `${productName} está fora de estoque`,
                variant: "destructive",
              });
            }
            
            // Alert when stock is replenished
            if (oldStock === 0 && newStock > 0) {
              toast({
                title: "✅ Estoque Reposto",
                description: `${productName} voltou ao estoque com ${newStock} unidades`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
};
