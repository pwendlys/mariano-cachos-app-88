import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppointmentActions } from './useAppointmentActions';

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
  const appointmentActions = useAppointmentActions();

  const fetchAppointments = async (filterDate?: Date | null) => {
    try {
      setLoading(true);
      console.log('Fetching appointments with date filter:', filterDate);
      
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          servico:servicos(nome, categoria)
        `);

      if (filterDate) {
        const formattedDate = filterDate.toISOString().split('T')[0];
        query = query.eq('data', formattedDate);
      }

      const { data: appointmentsData, error } = await query
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) {
        console.error('Fetch appointments error:', error);
        throw error;
      }

      const { data: profissionaisData, error: profError } = await supabase
        .from('profissionais')
        .select('id, nome, email');

      if (profError) {
        console.error('Fetch professionals error:', profError);
        throw profError;
      }

      const profissionaisMap = new Map(
        profissionaisData?.map(p => [p.id, { nome: p.nome, email: p.email }]) || []
      );

      const appointmentsWithDetails: Appointment[] = (appointmentsData || []).map(appointment => ({
        ...appointment,
        profissional: appointment.profissional_id ? profissionaisMap.get(appointment.profissional_id) : undefined
      }));

      console.log('Fetched appointments:', appointmentsWithDetails.length);
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
    console.log('Date filter changed:', date);
    setSelectedDate(date);
    fetchAppointments(date);
  };

  const handleStatusFilter = (status: string | null) => {
    console.log('Status filter changed:', status);
    setSelectedStatus(status);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const success = await appointmentActions.handleStatusChange(appointmentId, newStatus);
    if (success) {
      fetchAppointments(selectedDate);
    }
  };

  const handleProfessionalAssignment = async (appointmentId: string, professionalId: string) => {
    const success = await appointmentActions.handleProfessionalAssignment(appointmentId, professionalId);
    if (success) {
      fetchAppointments(selectedDate);
    }
  };

  const handleDateTimeUpdate = async (appointmentId: string, newDate: string, newTime: string) => {
    const success = await appointmentActions.handleDateTimeUpdate(appointmentId, newDate, newTime);
    if (success) {
      fetchAppointments(selectedDate);
    }
  };

  const handleValueUpdate = async (appointmentId: string, newValue: number): Promise<boolean> => {
    const success = await appointmentActions.handleValueUpdate(appointmentId, newValue);
    if (success) {
      fetchAppointments(selectedDate);
    }
    return success;
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
    handleDateTimeUpdate,
    handleValueUpdate
  };
};
