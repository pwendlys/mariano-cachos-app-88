
import React from 'react';
import { Calendar, X, CalendarDays, Clock, ChevronDown } from 'lucide-react';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AppointmentDateFilterProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

const AppointmentDateFilter: React.FC<AppointmentDateFilterProps> = ({
  selectedDate,
  onDateChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date || null);
    setIsOpen(false);
  };

  const handleQuickFilter = (date: Date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const clearFilter = () => {
    onDateChange(null);
  };

  const getDateLabel = () => {
    if (!selectedDate) return 'Todas as datas';
    
    if (isToday(selectedDate)) return 'Hoje';
    if (isTomorrow(selectedDate)) return 'Amanhã';
    
    return format(selectedDate, "dd 'de' MMMM", { locale: ptBR });
  };

  const today = new Date();
  const tomorrow = addDays(today, 1);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-between border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10",
              selectedDate && "border-salon-gold bg-salon-gold/10"
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{getDateLabel()}</span>
            </div>
            <ChevronDown size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Quick Filters */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-salon-gold">Filtros Rápidos</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(today)}
                  className={cn(
                    "justify-start border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10",
                    selectedDate && isToday(selectedDate) && "border-salon-gold bg-salon-gold/10"
                  )}
                >
                  <Clock size={14} className="mr-2" />
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(tomorrow)}
                  className={cn(
                    "justify-start border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10",
                    selectedDate && isTomorrow(selectedDate) && "border-salon-gold bg-salon-gold/10"
                  )}
                >
                  <CalendarDays size={14} className="mr-2" />
                  Amanhã
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(startOfWeek(today, { weekStartsOn: 0 }))}
                className="w-full justify-start border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
              >
                <CalendarDays size={14} className="mr-2" />
                Esta Semana
              </Button>
            </div>
            
            {/* Calendar */}
            <div className="border-t border-salon-gold/20 pt-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
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
          </div>
        </PopoverContent>
      </Popover>

      {selectedDate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilter}
          className="text-salon-copper hover:text-salon-gold hover:bg-salon-gold/10"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
};

export default AppointmentDateFilter;
