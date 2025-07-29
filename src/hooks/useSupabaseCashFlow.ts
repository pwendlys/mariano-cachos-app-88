
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CashFlowEntry {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  origem_tipo: string | null;
  origem_id: string | null;
  cliente_nome: string | null;
  profissional_nome: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CashFlowFilters {
  startDate?: string;
  endDate?: string;
  filterType: 'all' | 'entrada' | 'saida' | 'today' | 'week' | 'month';
}

export interface Client {
  id: string;
  nome: string;
  email: string;
}

export interface Professional {
  id: string;
  nome: string;
  email: string;
}

export interface AppointmentWithDetails {
  id: string;
  data: string;
  horario: string;
  status: string;
  status_cobranca: string;
  valor: number | null;
  cliente: {
    id: string;
    nome: string;
    email: string;
  } | null;
  servico: {
    id: string;
    nome: string;
    preco: number;
  } | null;
  profissional: {
    id: string;
    nome: string;
  } | null;
}

export const useSupabaseCashFlow = () => {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEntries = async (filters?: CashFlowFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from('fluxo_caixa')
        .select('*')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('data', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('data', filters.endDate);
      }

      if (filters?.filterType && filters.filterType !== 'all') {
        if (filters.filterType === 'entrada' || filters.filterType === 'saida') {
          query = query.eq('tipo', filters.filterType);
        } else if (filters.filterType === 'today') {
          const today = new Date().toISOString().split('T')[0];
          query = query.eq('data', today);
        } else if (filters.filterType === 'week') {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          query = query.gte('data', weekAgo);
        } else if (filters.filterType === 'month') {
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          query = query.gte('data', monthAgo);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion with proper validation
      const typedEntries: CashFlowEntry[] = (data || []).map(entry => ({
        ...entry,
        tipo: entry.tipo as 'entrada' | 'saida' // Safe type assertion
      }));
      
      setEntries(typedEntries);
    } catch (error) {
      console.error('Erro ao buscar entradas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o fluxo de caixa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, email')
        .order('nome');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('id, nome, email')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data,
          horario,
          status,
          status_cobranca,
          valor,
          profissional_id,
          cliente:clientes(id, nome, email),
          servico:servicos(id, nome, preco)
        `)
        .in('status', ['confirmado', 'concluido'])
        .order('data', { ascending: false })
        .order('horario', { ascending: false });

      if (error) throw error;
      
      // Get all professionals for lookup
      const { data: professionalsData, error: profError } = await supabase
        .from('profissionais')
        .select('id, nome');

      if (profError) throw profError;

      // Create a map for quick lookup
      const professionalsMap = new Map(
        professionalsData?.map(p => [p.id, { id: p.id, nome: p.nome }]) || []
      );
      
      // Map the data with proper professional information
      const typedAppointments: AppointmentWithDetails[] = (data || []).map(appointment => ({
        id: appointment.id,
        data: appointment.data,
        horario: appointment.horario,
        status: appointment.status,
        status_cobranca: appointment.status_cobranca,
        valor: appointment.valor,
        cliente: appointment.cliente,
        servico: appointment.servico,
        profissional: appointment.profissional_id ? professionalsMap.get(appointment.profissional_id) || null : null
      }));
      
      setAppointments(typedAppointments);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive",
      });
    }
  };

  const addEntry = async (entryData: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('fluxo_caixa')
        .insert([entryData]);

      if (error) throw error;

      toast({
        title: "Lançamento criado!",
        description: "O lançamento foi adicionado com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lançamento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAppointmentCollectionStatus = async (appointmentId: string, status: 'pendente' | 'cobrado' | 'pago') => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status_cobranca: status })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: "O status de cobrança foi atualizado com sucesso.",
      });

      await fetchAppointments();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status de cobrança:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchClients();
    fetchProfessionals();
    fetchAppointments();
  }, []);

  return {
    entries,
    clients,
    professionals,
    appointments,
    loading,
    fetchEntries,
    addEntry,
    updateAppointmentCollectionStatus,
    fetchAppointments
  };
};
