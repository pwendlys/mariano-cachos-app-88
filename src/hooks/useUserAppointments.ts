import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserAppointment {
  id: string;
  data: string;
  horario: string;
  valor: number;
  status: string;
  status_pagamento: string;
  observacoes?: string;
  created_at: string;
  servico: {
    nome: string;
    categoria: string;
    duracao: number;
  };
}

export const useUserAppointments = () => {
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserAppointments = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      // First get the client ID based on user email
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', user.email)
        .single();

      if (clientError || !clientData) {
        console.log('No client found for this user');
        setAppointments([]);
        setLoading(false);
        return;
      }

      // Then fetch appointments for this client
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data,
          horario,
          valor,
          status,
          status_pagamento,
          observacoes,
          created_at,
          servico:servicos(nome, categoria, duracao)
        `)
        .eq('cliente_id', clientData.id)
        .order('data', { ascending: false })
        .order('horario', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus agendamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAppointments();
  }, [user?.email]);

  const getStatusLabel = (status: string) => {
    const statusMap = {
      pendente: 'Aguardando Aprovação',
      confirmado: 'Confirmado',
      concluido: 'Concluído',
      rejeitado: 'Rejeitado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pendente: 'bg-yellow-500/20 text-yellow-400',
      confirmado: 'bg-green-500/20 text-green-400',
      concluido: 'bg-blue-500/20 text-blue-400',
      rejeitado: 'bg-red-500/20 text-red-400'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-500/20 text-gray-400';
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusMap = {
      pendente: 'Pagamento Pendente',
      pago: 'Pago',
      rejeitado: 'Pagamento Rejeitado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return {
    appointments,
    loading,
    getStatusLabel,
    getStatusColor,
    getPaymentStatusLabel,
    formatDate,
    refetch: fetchUserAppointments
  };
};