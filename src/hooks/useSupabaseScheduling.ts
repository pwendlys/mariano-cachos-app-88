
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
  duracao: number;
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
  chave_pix?: string;
  chave_pix_abacate?: string;
  qr_code_data?: string;
  transaction_id?: string;
  comprovante_pix?: string;
  created_at?: string;
  updated_at?: string;
  cliente?: Client;
  servico?: Service;
}

export const useSupabaseScheduling = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      console.log('Fetching services from Supabase...');
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Services fetched:', data);
      setServices((data || []) as Service[]);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erro ao carregar serviços",
        description: error.message || "Não foi possível carregar a lista de serviços.",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      console.log('Fetching appointments from Supabase...');
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*)
        `)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }
      
      console.log('Appointments fetched:', data);
      setAppointments((data || []) as Appointment[]);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message || "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    }
  };

  const createOrGetClient = async (clientData: Omit<Client, 'id'>): Promise<string | null> => {
    try {
      console.log('Creating or getting client:', clientData);
      
      // First, try to find existing client
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', clientData.email)
        .maybeSingle();

      if (existingClient) {
        console.log('Found existing client:', existingClient.id);
        return existingClient.id;
      }

      // Create new client
      const { data, error } = await supabase
        .from('clientes')
        .insert([clientData])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }
      
      console.log('Created new client:', data?.id);
      return data?.id || null;
    } catch (error: any) {
      console.error('Error creating/getting client:', error);
      return null;
    }
  };

  const createAppointment = async (appointmentData: {
    serviceId: string;
    data: string;
    horario: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    observacoes?: string;
    chave_pix?: string;
    chave_pix_abacate?: string;
    qr_code_data?: string;
    transaction_id?: string;
    comprovante_pix?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Creating appointment with data:', appointmentData);
      
      const clientId = await createOrGetClient({
        nome: appointmentData.clientName,
        email: appointmentData.clientEmail,
        telefone: appointmentData.clientPhone,
      });

      if (!clientId) {
        throw new Error('Não foi possível criar/obter cliente');
      }

      const service = services.find(s => s.id === appointmentData.serviceId);
      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      console.log('Creating appointment for client:', clientId, 'service:', service.id);

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
          chave_pix_abacate: appointmentData.chave_pix_abacate,
          qr_code_data: appointmentData.qr_code_data,
          transaction_id: appointmentData.transaction_id,
          comprovante_pix: appointmentData.comprovante_pix
        }]);

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      console.log('Appointment created successfully');
      await fetchAppointments();
      
      toast({
        title: "Agendamento enviado! ✨",
        description: "Seu agendamento foi enviado e o sinal foi processado. Aguarde a aprovação do administrador.",
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

  const isSlotAvailable = (date: string, time: string, serviceDuration: number): boolean => {
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + serviceDuration;

    const dayAppointments = appointments.filter(apt => 
      apt.data === date && 
      (apt.status === 'confirmado' || apt.status === 'pendente')
    );

    for (const appointment of dayAppointments) {
      const [aptHour, aptMinute] = appointment.horario.split(':').map(Number);
      const aptStartTime = aptHour * 60 + aptMinute;
      const aptEndTime = aptStartTime + (appointment.servico?.duracao || 0);

      if (
        (startTimeInMinutes < aptEndTime && endTimeInMinutes > aptStartTime) ||
        (aptStartTime < endTimeInMinutes && aptEndTime > startTimeInMinutes)
      ) {
        return false;
      }
    }

    return true;
  };

  const getSlotStatus = (date: string, time: string): 'livre' | 'ocupado' | 'pendente' => {
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

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

  useEffect(() => {
    console.log('useSupabaseScheduling hook initialized, fetching data...');
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
