
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Commission {
  id: string;
  profissional_id: string;
  tipo_origem: 'agendamento' | 'venda';
  origem_id: string;
  valor_base: number;
  percentual_comissao: number;
  valor_comissao: number;
  data_referencia: string;
  status: 'calculada' | 'paga' | 'cancelada';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionWithDetails extends Commission {
  profissional: {
    nome: string;
    email: string;
  };
}

export interface CommissionConfig {
  id: string;
  profissional_id: string;
  tipo_comissao: 'percentual' | 'fixo';
  valor_comissao: number;
  categoria_servico?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommissionConfigWithDetails extends CommissionConfig {
  profissional: {
    nome: string;
    email: string;
  };
}

export const useSupabaseCommissions = () => {
  const [commissions, setCommissions] = useState<CommissionWithDetails[]>([]);
  const [configs, setConfigs] = useState<CommissionConfigWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCommissions = async (filters?: {
    profissional_id?: string;
    tipo_origem?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('comissoes')
        .select(`
          *,
          profissional:profissionais(nome, email)
        `)
        .order('data_referencia', { ascending: false });

      if (filters?.profissional_id) {
        query = query.eq('profissional_id', filters.profissional_id);
      }
      if (filters?.tipo_origem) {
        query = query.eq('tipo_origem', filters.tipo_origem);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.data_inicio) {
        query = query.gte('data_referencia', filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte('data_referencia', filters.data_fim);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as comissões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_comissao')
        .select(`
          *,
          profissional:profissionais(nome, email)
        `)
        .order('profissional_id');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de comissão",
        variant: "destructive",
      });
    }
  };

  const addConfig = async (configData: Omit<CommissionConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_comissao')
        .insert(configData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Configuração criada!",
        description: "A configuração de comissão foi adicionada.",
      });

      await fetchConfigs();
      return data;
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a configuração",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: Partial<CommissionConfig>) => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_comissao')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Configuração atualizada!",
        description: "As configurações foram atualizadas com sucesso.",
      });

      await fetchConfigs();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCommissionStatus = async (id: string, status: Commission['status']) => {
    try {
      const { error } = await supabase
        .from('comissoes')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: "O status da comissão foi atualizado.",
      });

      await fetchCommissions();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getTotalCommissionsByProfessional = (profissional_id: string) => {
    return commissions
      .filter(c => c.profissional_id === profissional_id && c.status === 'calculada')
      .reduce((total, c) => total + Number(c.valor_comissao), 0);
  };

  useEffect(() => {
    fetchCommissions();
    fetchConfigs();
  }, []);

  return {
    commissions,
    configs,
    loading,
    fetchCommissions,
    fetchConfigs,
    addConfig,
    updateConfig,
    updateCommissionStatus,
    getTotalCommissionsByProfessional
  };
};
