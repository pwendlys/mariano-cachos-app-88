
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, X } from 'lucide-react';
import { useSupabaseProfessionals } from '@/hooks/useSupabaseProfessionals';

interface CommissionFiltersProps {
  filters: {
    profissional_id?: string;
    tipo_origem?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const CommissionFilters = ({ filters, onFiltersChange, onClearFilters }: CommissionFiltersProps) => {
  const { professionals } = useSupabaseProfessionals();

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" values back to undefined for the parent component
    const filterValue = value === "all" ? undefined : value;
    onFiltersChange({ ...filters, [key]: filterValue });
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-salon-gold" />
        <h3 className="text-lg font-medium text-salon-gold">Filtros</h3>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="ml-auto border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
          >
            <X size={16} className="mr-1" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filtro de Profissional */}
        <div>
          <label className="block text-sm font-medium text-salon-copper mb-2">
            Profissional
          </label>
          <Select 
            value={filters.profissional_id || 'all'} 
            onValueChange={(value) => handleFilterChange('profissional_id', value)}
          >
            <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="glass-card border-salon-gold/30">
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Tipo de Origem */}
        <div>
          <label className="block text-sm font-medium text-salon-copper mb-2">
            Tipo de Origem
          </label>
          <Select 
            value={filters.tipo_origem || 'all'} 
            onValueChange={(value) => handleFilterChange('tipo_origem', value)}
          >
            <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="glass-card border-salon-gold/30">
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="agendamento">Agendamento</SelectItem>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Status */}
        <div>
          <label className="block text-sm font-medium text-salon-copper mb-2">
            Status
          </label>
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="glass-card border-salon-gold/30">
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="calculada">Calculada</SelectItem>
              <SelectItem value="paga">Paga</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Data Início */}
        <div>
          <label className="block text-sm font-medium text-salon-copper mb-2">
            Data Início
          </label>
          <Input
            type="date"
            value={filters.data_inicio || ''}
            onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
            className="glass-card border-salon-gold/30 bg-transparent text-white"
          />
        </div>

        {/* Filtro de Data Fim */}
        <div>
          <label className="block text-sm font-medium text-salon-copper mb-2">
            Data Fim
          </label>
          <Input
            type="date"
            value={filters.data_fim || ''}
            onChange={(e) => handleFilterChange('data_fim', e.target.value)}
            className="glass-card border-salon-gold/30 bg-transparent text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default CommissionFilters;
