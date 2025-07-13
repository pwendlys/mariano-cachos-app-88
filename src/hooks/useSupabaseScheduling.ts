
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  nome: string;
  duracao: number; // em minutos
  preco: number;
  categoria: 'corte' | 'coloracao' | 'tratamento' | 'finalizacao' | 'outros';
  ativo: boolean;
  created_at?: string;
}

export interface Appointment {
  id: string;
  cliente_id: string;
  servico_id: string;
  data: string;
  horario: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'rejeitado';
  valor?: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  cliente?: Client;
  servico?: Service;
}

export const useSupabaseScheduling = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch services
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      // Type assertion to ensure proper types
      setServices((data || []) as Service[]);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar a lista de serviços.",
        variant: "destructive",
      });
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*)
        `)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) throw error;
      // Type assertion to ensure proper types
      setAppointments((data || []) as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    }
  };

  // Create or get client
  const createOrGetClient = async (clientData: Omit<Client, 'id'>): Promise<string | null> => {
    try {
      // First try to find existing client by email
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', clientData.email)
        .single();

      if (existingClient) {
        return existingClient.id;
      }

      // Create new client
      const { data, error } = await supabase
        .from('clientes')
        .insert([clientData])
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating/getting client:', error);
      return null;
    }
  };

  // Create appointment
  const createAppointment = async (appointmentData: {
    serviceId: string;
    data: string;
    horario: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    observacoes?: string;
    chave_pix?: string;
    comprovante_pix?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      // Create or get client
      const clientId = await createOrGetClient({
        nome: appointmentData.clientName,
        email: appointmentData.clientEmail,
        telefone: appointmentData.clientPhone,
      });

      if (!clientId) {
        throw new Error('Não foi possível criar/obter cliente');
      }

      // Get service price
      const service = services.find(s => s.id === appointmentData.serviceId);
      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      // Create appointment
      const { error } = await supabase
        .from('agendamentos')
        .insert([{
          cliente_id: clientId,
          servico_id: appointmentData.serviceId,
          data: appointmentData.data,
          horario: appointmentData.horario,
          valor: service.preco,
          observacoes: appointmentData.observacoes,
          status: 'pendente',
          status_pagamento: appointmentData.chave_pix ? 'pago' : 'pendente',
          chave_pix: appointmentData.chave_pix,
          comprovante_pix: appointmentData.comprovante_pix
        }]);

      if (error) throw error;

      // Refresh appointments
      await fetchAppointments();
      
      toast({
        title: "Agendamento enviado! ✨",
        description: "Seu agendamento foi enviado e aguarda aprovação do administrador.",
      });

      return true;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: error.message || "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if slot is available (just check for overlapping appointments, regardless of status)
  const isSlotAvailable = (date: string, time: string, serviceDuration: number): boolean => {
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + serviceDuration;

    // Check if any appointment (regardless of status) overlaps with this time slot
    const dayAppointments = appointments.filter(apt => 
      apt.data === date && 
      (apt.status === 'confirmado' || apt.status === 'pendente') // Only confirmed or pending appointments block slots
    );

    for (const appointment of dayAppointments) {
      const [aptHour, aptMinute] = appointment.horario.split(':').map(Number);
      const aptStartTime = aptHour * 60 + aptMinute;
      const aptEndTime = aptStartTime + (appointment.servico?.duracao || 0);

      // Check for overlap
      if (
        (startTimeInMinutes < aptEndTime && endTimeInMinutes > aptStartTime) ||
        (aptStartTime < endTimeInMinutes && aptEndTime > startTimeInMinutes)
      ) {
        return false;
      }
    }

    return true;
  };
  // Get appointment status for a specific time slot (for coloring)
  const getSlotStatus = (date: string, time: string): 'livre' | 'ocupado' | 'pendente' => {
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    // Find appointment that starts at this exact time
    const appointment = appointments.find(apt => {
      if (apt.data !== date) return false;
      
      const [aptHour, aptMinute] = apt.horario.split(':').map(Number);
      const aptStartTime = aptHour * 60 + aptMinute;
      
      return aptStartTime === startTimeInMinutes;
    });

    if (!appointment) return 'livre';
    
    if (appointment.status === 'confirmado') return 'ocupado';
    if (appointment.status === 'pendente') return 'pendente';
    
    return 'livre';
  };

  // Initialize data
  useEffect(() => {
    fetchServices();
    fetchAppointments();
  }, []);

  return {
    services,
    appointments,
    loading,
    createAppointment,
    isSlotAvailable,
    getSlotStatus,
    fetchServices,
    fetchAppointments,
  };
};
