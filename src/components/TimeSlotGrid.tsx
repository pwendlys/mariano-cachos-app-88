
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppointmentStatusIndicator from './AppointmentStatusIndicator';

interface TimeSlotGridProps {
  availableTimes: string[];
  selectedTime: string;
  selectedDate: string;
  serviceDuration: number;
  onTimeSelect: (time: string) => void;
  getSlotStatus: (date: string, time: string) => 'livre' | 'ocupado' | 'pendente';
  isSlotAvailable: (date: string, time: string, duration: number) => boolean;
  onEncaixeRequest?: (time: string) => void;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  availableTimes,
  selectedTime,
  selectedDate,
  serviceDuration,
  onTimeSelect,
  getSlotStatus,
  isSlotAvailable,
  onEncaixeRequest
}) => {
  const getTimeButtonClass = (time: string) => {
    if (!selectedDate) {
      return 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10';
    }

    const status = getSlotStatus(selectedDate, time);
    
    if (selectedTime === time) {
      return 'bg-salon-gold text-salon-dark hover:bg-salon-copper shadow-lg shadow-salon-gold/20';
    }
    
    switch (status) {
      case 'ocupado':
        return 'bg-orange-600/20 border-orange-600/50 text-orange-400 hover:bg-orange-600/30 cursor-pointer transition-colors';
      case 'pendente':
        return 'bg-yellow-600/20 border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/30 cursor-not-allowed';
      default:
        return 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 hover:border-salon-gold/60 hover:shadow-md transition-all duration-200';
    }
  };

  const canSelectTime = (time: string) => {
    if (!selectedDate) return false;
    const status = getSlotStatus(selectedDate, time);
    if (status === 'ocupado') return false;
    return isSlotAvailable(selectedDate, time, serviceDuration);
  };

  const handleTimeClick = (time: string) => {
    if (!selectedDate) return;
    
    const status = getSlotStatus(selectedDate, time);
    
    if (status === 'ocupado' && onEncaixeRequest) {
      onEncaixeRequest(time);
    } else if (canSelectTime(time)) {
      onTimeSelect(time);
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-salon-dark/20 rounded-lg border border-salon-gold/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-salon-gold/30 border border-salon-gold/50 rounded"></div>
          <span className="text-sm text-salon-copper">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-600/30 border border-yellow-600/50 rounded"></div>
          <span className="text-sm text-salon-copper">Aguardando Aprovação</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-600/30 border border-orange-600/50 rounded"></div>
          <span className="text-sm text-salon-copper">Solicitar o encaixe</span>
        </div>
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableTimes.map((time) => {
          const buttonClass = getTimeButtonClass(time);
          const status = selectedDate ? getSlotStatus(selectedDate, time) : 'livre';
          
          return (
            <div key={time} className="space-y-2">
              <Button
                variant="outline"
                className={`w-full h-14 text-lg font-medium transition-all duration-200 ${buttonClass}`}
                onClick={() => handleTimeClick(time)}
                disabled={!selectedDate || status === 'pendente'}
              >
                <Clock size={18} className="mr-2" />
                {time}
              </Button>
              
              {selectedDate && (
                <AppointmentStatusIndicator
                  status={status}
                  time={time}
                  onEncaixeRequest={() => onEncaixeRequest && onEncaixeRequest(time)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
