import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HistoricoAtendimento {
  id: string;
  cliente_id: string;
  agendamento_id?: string;
  data_atendimento: string;
  servicos_extras: any[];
  produtos_vendidos: any[];
  valor_servicos_extras: number;
  valor_produtos: number;
  observacoes?: string;
  status: 'pendente' | 'concluido' | 'cancelado';
  created_at: string;
  updated_at: string;
  cliente?: any;
  agendamento?: any;
}

export interface SaldoCliente {
  id: string;
  cliente_id: string;
  saldo_devedor: number;
  total_pago: number;
  total_servicos: number;
  total_produtos: number;
  ultima_atualizacao: string;
  created_at: string;
  updated_at: string;
  cliente?: any;
}

export const useCustomerProfiles = () => {
  const [historicoAtendimentos, setHistoricoAtendimentos] = useState<HistoricoAtendimento[]>([]);
  const [saldosClientes, setSaldosClientes] = useState<SaldoCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sincronizar dados dos clientes e agendamentos
  const syncCustomerData = async () => {
    setLoading(true);
    try {
      // Buscar todos os clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*');

      if (clientesError) throw clientesError;

      // Para cada cliente, calcular e atualizar o saldo
      for (const cliente of clientes || []) {
        await updateSaldoCliente(cliente.id);
      }

      // Buscar agendamentos confirmados e pagos para criar histórico automático
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*)
        `)
        .in('status', ['confirmado', 'concluido'])
        .not('valor', 'is', null);

      if (agendamentosError) throw agendamentosError;

      // Para cada agendamento, verificar se já existe histórico
      for (const agendamento of agendamentos || []) {
        const { data: historicoExistente } = await supabase
          .from('historico_atendimentos')
          .select('id')
          .eq('agendamento_id', agendamento.id)
          .single();

        // Se não existe histórico, criar baseado no agendamento
        if (!historicoExistente) {
          const statusHistorico = agendamento.status_pagamento === 'pago' ? 'concluido' : 'pendente';
          
          await supabase
            .from('historico_atendimentos')
            .insert({
              cliente_id: agendamento.cliente_id,
              agendamento_id: agendamento.id,
              data_atendimento: `${agendamento.data}T${agendamento.horario}`,
              servicos_extras: [],
              produtos_vendidos: [],
              valor_servicos_extras: agendamento.valor || 0,
              valor_produtos: 0,
              status: statusHistorico,
              observacoes: `Serviço: ${agendamento.servico?.nome} - Sincronizado automaticamente`
            });
        }
      }

      // Recarregar dados após sincronização
      await fetchHistoricoAtendimentos();
      await fetchSaldosClientes();

      toast({
        title: "Sucesso",
        description: "Dados dos clientes sincronizados com sucesso."
      });

    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar os dados dos clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar histórico de atendimentos
  const fetchHistoricoAtendimentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('historico_atendimentos')
        .select(`
          *,
          cliente:clientes(*),
          agendamento:agendamentos(*)
        `)
        .order('data_atendimento', { ascending: false });

      if (error) throw error;
      setHistoricoAtendimentos((data || []) as HistoricoAtendimento[]);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de atendimentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar saldos dos clientes
  const fetchSaldosClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saldos_clientes')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .order('ultima_atualizacao', { ascending: false });

      if (error) throw error;
      setSaldosClientes((data || []) as SaldoCliente[]);
    } catch (error) {
      console.error('Erro ao carregar saldos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os saldos dos clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar histórico de atendimento
  const createHistoricoAtendimento = async (historico: Omit<HistoricoAtendimento, 'id' | 'created_at' | 'updated_at' | 'cliente' | 'agendamento'>) => {
    try {
      const { data, error } = await supabase
        .from('historico_atendimentos')
        .insert([historico])
        .select()
        .single();

      if (error) throw error;
      
      await fetchHistoricoAtendimentos();
      await updateSaldoCliente(historico.cliente_id);
      
      toast({
        title: "Sucesso",
        description: "Histórico de atendimento criado com sucesso."
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o histórico de atendimento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar histórico de atendimento
  const updateHistoricoAtendimento = async (id: string, updates: Partial<HistoricoAtendimento>) => {
    try {
      const { error } = await supabase
        .from('historico_atendimentos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchHistoricoAtendimentos();
      
      toast({
        title: "Sucesso",
        description: "Histórico atualizado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o histórico.",
        variant: "destructive"
      });
    }
  };

  // Atualizar saldo do cliente
  const updateSaldoCliente = async (clienteId: string) => {
    try {
      // Calcular totais do histórico
      const { data: historicos, error: historicoError } = await supabase
        .from('historico_atendimentos')
        .select('valor_servicos_extras, valor_produtos, status')
        .eq('cliente_id', clienteId)
        .eq('status', 'concluido');

      if (historicoError) throw historicoError;

      const totalServicos = historicos?.reduce((sum, h) => sum + (h.valor_servicos_extras || 0), 0) || 0;
      const totalProdutos = historicos?.reduce((sum, h) => sum + (h.valor_produtos || 0), 0) || 0;

      // Calcular total pago dos agendamentos
      const { data: agendamentos, error: agendamentoError } = await supabase
        .from('agendamentos')
        .select('valor, status_pagamento')
        .eq('cliente_id', clienteId)
        .eq('status_pagamento', 'pago');

      if (agendamentoError) throw agendamentoError;

      const totalPago = agendamentos?.reduce((sum, a) => sum + (a.valor || 0), 0) || 0;
      const saldoDevedor = (totalServicos + totalProdutos) - totalPago;

      // Upsert no saldo do cliente
      const { error: upsertError } = await supabase
        .from('saldos_clientes')
        .upsert({
          cliente_id: clienteId,
          saldo_devedor: Math.max(0, saldoDevedor),
          total_pago: totalPago,
          total_servicos: totalServicos,
          total_produtos: totalProdutos,
          ultima_atualizacao: new Date().toISOString()
        }, {
          onConflict: 'cliente_id'
        });

      if (upsertError) throw upsertError;
      
      await fetchSaldosClientes();
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    }
  };

  // Vincular agendamento ao histórico
  const linkAgendamentoToHistorico = async (agendamentoId: string) => {
    try {
      // Buscar agendamento
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*)
        `)
        .eq('id', agendamentoId)
        .single();

      if (agendamentoError) throw agendamentoError;

      // Criar histórico baseado no agendamento
      await createHistoricoAtendimento({
        cliente_id: agendamento.cliente_id,
        agendamento_id: agendamentoId,
        data_atendimento: new Date().toISOString(),
        servicos_extras: [],
        produtos_vendidos: [],
        valor_servicos_extras: 0,
        valor_produtos: 0,
        status: 'pendente',
        observacoes: `Atendimento baseado no agendamento: ${agendamento.servico?.nome}`
      });

    } catch (error) {
      console.error('Erro ao vincular agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o agendamento ao histórico.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchHistoricoAtendimentos();
    fetchSaldosClientes();
  }, []);

  return {
    historicoAtendimentos,
    saldosClientes,
    loading,
    createHistoricoAtendimento,
    updateHistoricoAtendimento,
    updateSaldoCliente,
    linkAgendamentoToHistorico,
    fetchHistoricoAtendimentos,
    fetchSaldosClientes,
    syncCustomerData
  };
};
