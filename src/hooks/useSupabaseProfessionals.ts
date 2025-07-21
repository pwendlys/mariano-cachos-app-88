
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseProfessional {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidades: string[];
  avatar?: string;
  ativo: boolean;
  percentual_comissao_padrao: number;
  created_at: string;
  updated_at: string;
}

export const useSupabaseProfessionals = () => {
  const [professionals, setProfessionals] = useState<SupabaseProfessional[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProfessional = async (professionalData: Omit<SupabaseProfessional, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .insert(professionalData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Profissional criado!",
        description: "O profissional foi adicionado com sucesso.",
      });

      await fetchProfessionals();
      return data;
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o profissional",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfessional = async (id: string, updates: Partial<SupabaseProfessional>) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Profissional atualizado!",
        description: "As informações foram atualizadas com sucesso.",
      });

      await fetchProfessionals();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o profissional",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProfessional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Profissional removido",
        description: "O profissional foi excluído do sistema.",
      });

      await fetchProfessionals();
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o profissional",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getActiveProfessionals = () => {
    return professionals.filter(prof => prof.ativo);
  };

  const getProfessionalById = (id: string) => {
    return professionals.find(prof => prof.id === id);
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('professionals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profissionais'
        },
        (payload) => {
          console.log('Professionals real-time update:', payload);
          fetchProfessionals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  return {
    professionals,
    loading,
    fetchProfessionals,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    getActiveProfessionals,
    getProfessionalById
  };
};
