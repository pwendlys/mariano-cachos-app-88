
import React from 'react';
import { Calendar, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CashFlowFiltersProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  filterType: 'all' | 'entrada' | 'saida' | 'today' | 'week' | 'month';
  onFilterTypeChange: (type: 'all' | 'entrada' | 'saida' | 'today' | 'week' | 'month') => void;
  onClearFilters: () => void;
}

const CashFlowFilters: React.FC<CashFlowFiltersProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  filterType,
  onFilterTypeChange,
  onClearFilters
}) => {
  console.log('CashFlowFilters - filterType:', filterType);
  
  const handleFilterTypeChange = (value: string) => {
    console.log('CashFlowFilters - changing filterType to:', value);
    if (['all', 'entrada', 'saida', 'today', 'week', 'month'].includes(value)) {
      onFilterTypeChange(value as 'all' | 'entrada' | 'saida' | 'today' | 'week' | 'month');
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    onStartDateChange(date ? date.toISOString().split('T')[0] : undefined);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    onEndDateChange(date ? date.toISOString().split('T')[0] : undefined);
  };

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-salon-gold" />
            <span className="text-salon-gold font-medium">Filtros:</span>
          </div>

          {/* Período */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">De:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "glass-card border-salon-gold/30 bg-transparent text-white h-10",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <Calendar size={16} className="mr-2" />
                  {startDate ? format(new Date(startDate), "dd/MM/yyyy") : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card border-salon-gold/30" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={handleStartDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Até:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "glass-card border-salon-gold/30 bg-transparent text-white h-10",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <Calendar size={16} className="mr-2" />
                  {endDate ? format(new Date(endDate), "dd/MM/yyyy") : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card border-salon-gold/30" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={handleEndDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Tipo:</span>
            <Select value={filterType} onValueChange={handleFilterTypeChange}>
              <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-10 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-salon-gold/30">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span>Todos</span>
                  </div>
                </SelectItem>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-400" />
                    <span>Receitas</span>
                  </div>
                </SelectItem>
                <SelectItem value="saida">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={16} className="text-red-400" />
                    <span>Despesas</span>
                  </div>
                </SelectItem>
                <SelectItem value="today">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Hoje</span>
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Esta semana</span>
                  </div>
                </SelectItem>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Este mês</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limpar filtros */}
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-10"
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowFilters;
