
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
  imagem?: string | null;
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
      console.log('🔄 [useSupabaseScheduling] Fetching active services from Supabase...');
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ [useSupabaseScheduling] Error fetching services:', error);
        throw error;
      }
      
      console.log('✅ [useSupabaseScheduling] Active services fetched successfully:', data);
      setServices((data || []) as Service[]);
    } catch (error: any) {
      console.error('❌ [useSupabaseScheduling] Error in fetchServices:', error);
      toast({
        title: "Erro ao carregar serviços",
        description: error.message || "Não foi possível carregar a lista de serviços.",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      console.log('🔄 [useSupabaseScheduling] Fetching appointments from Supabase...');
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
        console.error('❌ [useSupabaseScheduling] Error fetching appointments:', error);
        throw error;
      }
      
      console.log('✅ [useSupabaseScheduling] Appointments fetched successfully:', data);
      setAppointments((data || []) as Appointment[]);
    } catch (error: any) {
      console.error('❌ [useSupabaseScheduling] Error in fetchAppointments:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message || "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    }
  };

  const createOrGetClient = async (clientData: Omit<Client, 'id'>): Promise<string | null> => {
    try {
      console.log('👤 [useSupabaseScheduling] Creating or getting client:', clientData);
      
      // First, try to find existing client
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', clientData.email)
        .maybeSingle();

      if (existingClient) {
        console.log('✅ [useSupabaseScheduling] Found existing client:', existingClient.id);
        return existingClient.id;
      }

      // Create new client
      const { data, error } = await supabase
        .from('clientes')
        .insert([clientData])
        .select('id')
        .single();

      if (error) {
        console.error('❌ [useSupabaseScheduling] Error creating client:', error);
        throw error;
      }
      
      console.log('✅ [useSupabaseScheduling] Created new client:', data?.id);
      return data?.id || null;
    } catch (error: any) {
      console.error('❌ [useSupabaseScheduling] Error in createOrGetClient:', error);
      return null;
    }
  };

  const createMultipleAppointments = async (appointmentData: {
    serviceIds: string[];
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
      console.log('📅 [useSupabaseScheduling] Creating multiple appointments with data:', appointmentData);
      
      const clientId = await createOrGetClient({
        nome: appointmentData.clientName,
        email: appointmentData.clientEmail,
        telefone: appointmentData.clientPhone,
      });

      if (!clientId) {
        throw new Error('Não foi possível criar/obter cliente');
      }

      // Calculate total duration and price
      let totalDuration = 0;
      let totalPrice = 0;
      let currentTime = appointmentData.horario;

      const appointmentsToCreate = [];

      for (const serviceId of appointmentData.serviceIds) {
        const service = services.find(s => s.id === serviceId);
        if (!service) {
          throw new Error(`Serviço ${serviceId} não encontrado`);
        }

        appointmentsToCreate.push({
          cliente_id: clientId,
          servico_id: serviceId,
          data: appointmentData.data,
          horario: currentTime,
          valor: service.preco,
          observacoes: appointmentData.observacoes,
          status: 'pendente',
          status_pagamento: appointmentData.chave_pix ? 'pago' : 'pendente',
          chave_pix: appointmentData.chave_pix,
          chave_pix_abacate: appointmentData.chave_pix_abacate,
          qr_code_data: appointmentData.qr_code_data,
          transaction_id: appointmentData.transaction_id,
          comprovante_pix: appointmentData.comprovante_pix
        });

        totalDuration += service.duracao;
        totalPrice += service.preco;

        // Calculate next time slot
        const [hour, minute] = currentTime.split(':').map(Number);
        const nextTimeInMinutes = (hour * 60 + minute) + service.duracao;
        const nextHour = Math.floor(nextTimeInMinutes / 60);
        const nextMinute = nextTimeInMinutes % 60;
        currentTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
      }

      console.log('✅ [useSupabaseScheduling] Creating appointments for client:', clientId);

      const { error } = await supabase
        .from('agendamentos')
        .insert(appointmentsToCreate);

      if (error) {
        console.error('❌ [useSupabaseScheduling] Error creating appointments:', error);
        throw error;
      }

      console.log('✅ [useSupabaseScheduling] Multiple appointments created successfully');
      
      toast({
        title: "Agendamentos enviados! ✨",
        description: `${appointmentData.serviceIds.length} serviços agendados. Aguarde a aprovação do administrador.`,
      });

      return true;
    } catch (error: any) {
      console.error('❌ [useSupabaseScheduling] Error in createMultipleAppointments:', error);
      toast({
        title: "Erro ao criar agendamentos",
        description: error.message || "Não foi possível criar os agendamentos.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
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
    return createMultipleAppointments({
      serviceIds: [appointmentData.serviceId],
      data: appointmentData.data,
      horario: appointmentData.horario,
      clientName: appointmentData.clientName,
      clientEmail: appointmentData.clientEmail,
      clientPhone: appointmentData.clientPhone,
      observacoes: appointmentData.observacoes,
      chave_pix: appointmentData.chave_pix,
      chave_pix_abacate: appointmentData.chave_pix_abacate,
      qr_code_data: appointmentData.qr_code_data,
      transaction_id: appointmentData.transaction_id,
      comprovante_pix: appointmentData.comprovante_pix
    });
  };

  const getSlotStatus = (date: string, time: string): 'livre' | 'ocupado' | 'pendente' => {
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    const appointment = appointments.find(apt => {
      if (apt.data !== date) return false;
      
      const [aptHour, aptMinute] = apt.horario.split(':').map(Number);
      const aptStartTime = aptHour * 60 + aptMinute;
      const aptEndTime = aptStartTime + (apt.servico?.duracao || 0);
      
      // Check if the time slot overlaps with this appointment
      return startTimeInMinutes >= aptStartTime && startTimeInMinutes < aptEndTime;
    });

    if (!appointment) return 'livre';
    
    if (appointment.status === 'confirmado') return 'ocupado';
    if (appointment.status === 'pendente') return 'pendente';
    
    return 'livre';
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
        (startTimeInMinutes < aptEndTime && endTimeInMinutes > aptStartTime)
      ) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    console.log('🚀 [useSupabaseScheduling] Hook initialized, setting up real-time subscriptions...');
    
    fetchServices();
    fetchAppointments();

    const servicesChannel = supabase
      .channel('scheduling-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'servicos'
        },
        (payload) => {
          console.log('📡 [useSupabaseScheduling] Real-time change detected in servicos:', payload);
          fetchServices();
        }
      )
      .subscribe();

    const appointmentsChannel = supabase
      .channel('scheduling-appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos'
        },
        (payload) => {
          console.log('📡 [useSupabaseScheduling] Real-time change detected in agendamentos:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 [useSupabaseScheduling] Cleaning up real-time subscriptions');
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, []);

  return {
    services,
    appointments,
    loading,
    createAppointment,
    createMultipleAppointments,
    isSlotAvailable,
    getSlotStatus,
    fetchServices,
    fetchAppointments,
  };
};
