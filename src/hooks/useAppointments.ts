
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  data: string;
  horario: string;
  valor: number;
  status: string;
  status_pagamento: string;
  chave_pix: string;
  comprovante_pix: string;
  observacoes?: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  servico: {
    nome: string;
    categoria: string;
  };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          servico:servicos(nome, categoria)
        `)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) throw error;

      const fetchedAppointments = data || [];
      setAllAppointments(fetchedAppointments);
      
      // Apply date filter if selected
      if (selectedDate) {
        filterAppointmentsByDate(fetchedAppointments, selectedDate);
      } else {
        setAppointments(fetchedAppointments);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAppointmentsByDate = (appointmentsList: Appointment[], date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const filtered = appointmentsList.filter(appointment => appointment.data === dateString);
    setAppointments(filtered);
  };

  const handleDateFilterChange = (date: Date | null) => {
    setSelectedDate(date);
    
    if (date) {
      filterAppointmentsByDate(allAppointments, date);
    } else {
      setAppointments(allAppointments);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      const statusLabels = {
        pendente: 'aguardando',
        confirmado: 'confirmado',
        concluido: 'concluído',
        rejeitado: 'rejeitado'
      };

      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${statusLabels[newStatus as keyof typeof statusLabels]}`,
      });
      
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do agendamento",
        variant: "destructive",
      });
    }
  };

  const handleDateTimeUpdate = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          data: newDate,
          horario: newTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Agendamento atualizado",
        description: `Data e horário alterados com sucesso`,
      });
      
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar data/horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a data e horário do agendamento",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    selectedDate,
    fetchAppointments,
    handleStatusChange,
    handleDateTimeUpdate,
    handleDateFilterChange
  };
};
