
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
  profissional_id?: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  servico: {
    nome: string;
    categoria: string;
  };
  profissional?: {
    nome: string;
    email: string;
  };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async (filterDate?: Date | null) => {
    try {
      setLoading(true);
      
      // Get appointments with cliente and servico relations
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          servico:servicos(nome, categoria)
        `);

      // Apply date filter if provided
      if (filterDate) {
        const formattedDate = filterDate.toISOString().split('T')[0];
        query = query.eq('data', formattedDate);
      }

      const { data: appointmentsData, error } = await query
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) throw error;

      // Get all professionals
      const { data: profissionaisData, error: profError } = await supabase
        .from('profissionais')
        .select('id, nome, email');

      if (profError) throw profError;

      // Create a map for quick lookup
      const profissionaisMap = new Map(
        profissionaisData?.map(p => [p.id, { nome: p.nome, email: p.email }]) || []
      );

      // Combine data manually
      const appointmentsWithDetails: Appointment[] = (appointmentsData || []).map(appointment => ({
        ...appointment,
        profissional: appointment.profissional_id ? profissionaisMap.get(appointment.profissional_id) : undefined
      }));

      setAppointments(appointmentsWithDetails);
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

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    fetchAppointments(date);
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
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
      
      fetchAppointments(selectedDate);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do agendamento",
        variant: "destructive",
      });
    }
  };

  const handleProfessionalAssignment = async (appointmentId: string, professionalId: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ profissional_id: professionalId })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Profissional atribuído",
        description: "O profissional foi atribuído ao agendamento com sucesso",
      });
      
      fetchAppointments(selectedDate);
    } catch (error) {
      console.error('Erro ao atribuir profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o profissional",
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
      
      fetchAppointments(selectedDate);
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
    selectedStatus,
    fetchAppointments,
    handleDateChange,
    handleStatusFilter,
    handleStatusChange,
    handleProfessionalAssignment,
    handleDateTimeUpdate
  };
};
