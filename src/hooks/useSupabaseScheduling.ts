
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
  status: 'livre' | 'pendente' | 'ocupado' | 'cancelado';
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
      setServices(data || []);
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
      setAppointments(data || []);
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
          status: 'pendente'
        }]);

      if (error) throw error;

      // Refresh appointments
      await fetchAppointments();
      
      toast({
        title: "Agendamento criado! ✨",
        description: "Seu agendamento foi confirmado com sucesso.",
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

  // Check if slot is available
  const isSlotAvailable = (date: string, time: string, serviceDuration: number): boolean => {
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + serviceDuration;

    // Check if any appointment overlaps with this time slot
    const dayAppointments = appointments.filter(apt => apt.data === date);

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
    fetchServices,
    fetchAppointments,
  };
};
