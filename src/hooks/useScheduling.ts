
import { useState, useEffect } from 'react';
import { useTimeBlocking } from './useTimeBlocking';

export interface Appointment {
  id: string;
  serviceIds: string[]; // Mudança: array de IDs de serviços
  professionalId: string;
  date: string;
  time: string;
  duration: number; // em minutos - soma de todos os serviços
  clientName: string;
  clientPhone: string;
  observations?: string;
}

export const useScheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem('salon-appointments');
    return stored ? JSON.parse(stored) : [];
  });

  const { getBlockedSlots } = useTimeBlocking();

  useEffect(() => {
    localStorage.setItem('salon-appointments', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const getUnavailableSlots = (date: string, professionalId: string) => {
    // Slots ocupados por agendamentos
    const dayAppointments = appointments.filter(
      apt => apt.date === date && apt.professionalId === professionalId
    );

    const unavailableSlots: string[] = [];

    dayAppointments.forEach(appointment => {
      const [startHour, startMinute] = appointment.time.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = startTimeInMinutes + appointment.duration;

      // Gerar todos os slots ocupados baseado na duração
      for (let time = startTimeInMinutes; time < endTimeInMinutes; time += 30) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        unavailableSlots.push(timeSlot);
      }
    });

    // Adicionar slots bloqueados
    const blockedSlots = getBlockedSlots(date, professionalId);
    unavailableSlots.push(...blockedSlots);

    return [...new Set(unavailableSlots)]; // Remove duplicatas
  };

  const isSlotAvailable = (date: string, time: string, professionalId: string, serviceDuration: number) => {
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + serviceDuration;

    // Verificar se algum slot necessário para este serviço está ocupado
    for (let checkTime = startTimeInMinutes; checkTime < endTimeInMinutes; checkTime += 30) {
      const hours = Math.floor(checkTime / 60);
      const minutes = checkTime % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const unavailableSlots = getUnavailableSlots(date, professionalId);
      if (unavailableSlots.includes(timeSlot)) {
        return false;
      }
    }

    return true;
  };

  return {
    appointments,
    addAppointment,
    getUnavailableSlots,
    isSlotAvailable
  };
};
