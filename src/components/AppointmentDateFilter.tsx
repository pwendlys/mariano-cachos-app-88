
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AppointmentDateFilterProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

const AppointmentDateFilter: React.FC<AppointmentDateFilterProps> = ({
  selectedDate,
  onDateChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  const thisWeekStart = new Date();
  const dayOfWeek = thisWeekStart.getDay();
  thisWeekStart.setDate(thisWeekStart.getDate() - dayOfWeek);

  const handleQuickFilter = (date: Date | null) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "Todas as datas";
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return "Hoje";
    if (isTomorrow) return "Amanhã";
    
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10",
              "justify-start text-left font-normal min-w-[200px]"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateForDisplay(selectedDate)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glass-card border-salon-gold/20" align="start">
          <div className="p-3">
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(null)}
                className={cn(
                  "text-xs border-salon-gold/30",
                  !selectedDate && "bg-salon-gold/20 text-salon-gold"
                )}
              >
                <Filter className="w-3 h-3 mr-1" />
                Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(today)}
                className={cn(
                  "text-xs border-salon-gold/30",
                  selectedDate?.toDateString() === today.toDateString() && "bg-salon-gold/20 text-salon-gold"
                )}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(tomorrow)}
                className={cn(
                  "text-xs border-salon-gold/30",
                  selectedDate?.toDateString() === tomorrow.toDateString() && "bg-salon-gold/20 text-salon-gold"
                )}
              >
                Amanhã
              </Button>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => {
                onDateChange(date || null);
                setIsOpen(false);
              }}
              initialFocus
              className="pointer-events-auto"
              modifiers={{
                today: today
              }}
              modifiersStyles={{
                today: {
                  backgroundColor: 'hsl(var(--salon-gold) / 0.2)',
                  color: 'hsl(var(--salon-gold))',
                  fontWeight: 'bold'
                }
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AppointmentDateFilter;
