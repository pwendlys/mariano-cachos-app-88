import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Devedor {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  documento?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Divida {
  id: string;
  devedor_id: string;
  descricao: string;
  valor_original: number;
  valor_atual: number;
  data_vencimento: string;
  data_inclusao: string;
  status: 'em_aberto' | 'pago' | 'parcelado' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  devedor?: Devedor;
}

export interface Cobranca {
  id: string;
  divida_id: string;
  tipo: 'whatsapp' | 'email' | 'sms' | 'ligacao';
  status: 'pendente' | 'enviado' | 'entregue' | 'lido' | 'respondido' | 'erro';
  data_envio?: string;
  data_entrega?: string;
  data_leitura?: string;
  mensagem?: string;
  resposta?: string;
  tentativa: number;
  erro?: string;
  created_at: string;
}

export interface SaldoCliente {
  id: string;
  cliente_id: string;
  saldo_devedor: number;
  total_pago: number;
  total_servicos: number;
  total_produtos: number;
  ultima_atualizacao: string;
  cliente?: {
    nome: string;
    email: string;
    telefone: string;
  };
}

export const useDebtCollection = () => {
  const [devedores, setDevedores] = useState<Devedor[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [saldosClientes, setSaldosClientes] = useState<SaldoCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar saldos dos clientes
  const fetchSaldosClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('saldos_clientes')
        .select(`
          *,
          cliente:clientes(nome, email, telefone)
        `)
        .order('ultima_atualizacao', { ascending: false });

      if (error) throw error;
      setSaldosClientes((data || []) as SaldoCliente[]);
    } catch (error) {
      console.error('Erro ao carregar saldos dos clientes:', error);
    }
  };

  // Carregar devedores
  const fetchDevedores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('devedores')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setDevedores(data || []);
    } catch (error) {
      console.error('Erro ao carregar devedores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os devedores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dívidas
  const fetchDividas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dividas')
        .select(`
          *,
          devedor:devedores(*)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      setDividas((data || []) as Divida[]);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as dívidas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar cobranças
  const fetchCobrancas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cobrancas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCobrancas((data || []) as Cobranca[]);
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cobranças.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar devedor
  const createDevedor = async (devedor: Omit<Devedor, 'id' | 'created_at' | 'updated_at' | 'ativo'>) => {
    try {
      const { data, error } = await supabase
        .from('devedores')
        .insert([{ ...devedor, ativo: true }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDevedores();
      toast({
        title: "Sucesso",
        description: "Devedor criado com sucesso."
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar devedor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o devedor.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Criar dívida
  const createDivida = async (divida: Omit<Divida, 'id' | 'created_at' | 'updated_at' | 'devedor' | 'data_inclusao'>) => {
    try {
      const { data, error } = await supabase
        .from('dividas')
        .insert([{
          ...divida,
          data_inclusao: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDividas();
      toast({
        title: "Sucesso",
        description: "Dívida registrada com sucesso."
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar dívida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a dívida.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar status da dívida
  const updateDividaStatus = async (dividaId: string, status: Divida['status']) => {
    try {
      const { error } = await supabase
        .from('dividas')
        .update({ status })
        .eq('id', dividaId);

      if (error) throw error;
      
      await fetchDividas();
      toast({
        title: "Sucesso",
        description: "Status da dívida atualizado."
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  // Registrar cobrança
  const createCobranca = async (cobranca: Omit<Cobranca, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cobrancas')
        .insert([cobranca])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCobrancas();
      toast({
        title: "Sucesso",
        description: "Cobrança registrada com sucesso."
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao registrar cobrança:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a cobrança.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Calcular totais
  const getTotals = () => {
    // Totals from dividas table (specific debts)
    const totalDividasEmAberto = dividas
      .filter(d => d.status === 'em_aberto')
      .reduce((sum, d) => sum + d.valor_atual, 0);

    const totalDividasRecebido = dividas
      .filter(d => d.status === 'pago')
      .reduce((sum, d) => sum + d.valor_atual, 0);

    const totalDividasParcelado = dividas
      .filter(d => d.status === 'parcelado')
      .reduce((sum, d) => sum + d.valor_atual, 0);

    // Totals from saldos_clientes table (client balances)
    const totalSaldosDevedor = saldosClientes
      .reduce((sum, s) => sum + s.saldo_devedor, 0);

    const totalSaldosPago = saldosClientes
      .reduce((sum, s) => sum + s.total_pago, 0);

    // Combined totals (avoiding duplication by using the higher value for open debts)
    const totalEmAberto = Math.max(totalDividasEmAberto, totalSaldosDevedor);
    const totalRecebido = Math.max(totalDividasRecebido, totalSaldosPago);
    const totalParcelado = totalDividasParcelado;

    return {
      totalEmAberto,
      totalRecebido,
      totalParcelado,
      totalGeral: totalEmAberto + totalRecebido + totalParcelado,
      // Separate totals for debugging/reporting
      totalDividasEmAberto,
      totalSaldosDevedor,
      totalDividasRecebido,
      totalSaldosPago
    };
  };

  useEffect(() => {
    fetchDevedores();
    fetchDividas();
    fetchCobrancas();
    fetchSaldosClientes();
  }, []);

  return {
    devedores,
    dividas,
    cobrancas,
    saldosClientes,
    loading,
    createDevedor,
    createDivida,
    updateDividaStatus,
    createCobranca,
    fetchDevedores,
    fetchDividas,
    fetchCobrancas,
    fetchSaldosClientes,
    getTotals: getTotals()
  };
};
