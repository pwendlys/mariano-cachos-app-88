
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type CashFlowEntry = Tables<'fluxo_caixa'>;

export interface CashFlowFilters {
  startDate?: Date;
  endDate?: Date;
  filterType: 'all' | 'entrada' | 'saida';
}

export const useSupabaseCashFlow = () => {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEntries = async (filters?: CashFlowFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from('fluxo_caixa')
        .select('*')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.filterType && filters.filterType !== 'all') {
        query = query.eq('tipo', filters.filterType);
      }

      if (filters?.startDate) {
        query = query.gte('data', filters.startDate.toISOString().split('T')[0]);
      }

      if (filters?.endDate) {
        query = query.lte('data', filters.endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cash flow entries:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os lançamentos do fluxo de caixa.",
          variant: "destructive"
        });
        return;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Error in fetchEntries:', error);
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro inesperado ao carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entryData: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('fluxo_caixa')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        console.error('Error adding cash flow entry:', error);
        toast({
          title: "Erro ao adicionar lançamento",
          description: "Não foi possível adicionar o lançamento.",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Lançamento adicionado!",
        description: "O registro foi criado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error in addEntry:', error);
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro inesperado ao adicionar o lançamento.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEntry = async (id: string, updates: Partial<CashFlowEntry>) => {
    try {
      const { data, error } = await supabase
        .from('fluxo_caixa')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating cash flow entry:', error);
        toast({
          title: "Erro ao atualizar lançamento",
          description: "Não foi possível atualizar o lançamento.",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Lançamento atualizado!",
        description: "O registro foi atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error in updateEntry:', error);
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro inesperado ao atualizar o lançamento.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fluxo_caixa')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting cash flow entry:', error);
        toast({
          title: "Erro ao excluir lançamento",
          description: "Não foi possível excluir o lançamento.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Lançamento removido",
        description: "O registro foi excluído do sistema.",
      });

      return true;
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro inesperado ao excluir o lançamento.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('cash-flow-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fluxo_caixa'
        },
        (payload) => {
          console.log('Cash flow real-time update:', payload);
          // Refresh data when changes occur
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    loading,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry
  };
};
