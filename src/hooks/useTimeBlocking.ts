
import { useState, useEffect } from 'react';

export interface TimeBlock {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  type: 'break' | 'holiday' | 'maintenance' | 'other';
  professionalId?: string; // Se não especificado, bloqueia para todos
}

export const useTimeBlocking = () => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    const stored = localStorage.getItem('salon-time-blocks');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('salon-time-blocks', JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  const addTimeBlock = (timeBlock: TimeBlock) => {
    setTimeBlocks(prev => [...prev, timeBlock]);
  };

  const updateTimeBlock = (blockId: string, updatedBlock: TimeBlock) => {
    setTimeBlocks(prev => prev.map(block => block.id === blockId ? updatedBlock : block));
  };

  const deleteTimeBlock = (blockId: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const getBlockedSlots = (date: string, professionalId?: string) => {
    const dayBlocks = timeBlocks.filter(block => {
      const blockDate = block.date;
      const isDateMatch = blockDate === date;
      const isProfessionalMatch = !block.professionalId || block.professionalId === professionalId;
      return isDateMatch && isProfessionalMatch;
    });

    const blockedSlots: string[] = [];

    dayBlocks.forEach(block => {
      const [startHour, startMinute] = block.startTime.split(':').map(Number);
      const [endHour, endMinute] = block.endTime.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      for (let time = startTimeInMinutes; time < endTimeInMinutes; time += 30) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        blockedSlots.push(timeSlot);
      }
    });

    return blockedSlots;
  };

  const isTimeBlocked = (date: string, time: string, professionalId?: string) => {
    const blockedSlots = getBlockedSlots(date, professionalId);
    return blockedSlots.includes(time);
  };

  return {
    timeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    getBlockedSlots,
    isTimeBlocked
  };
};
