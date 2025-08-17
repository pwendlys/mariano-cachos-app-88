
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
  categories: string[];
  totalResults: number;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
  categories,
  totalResults
}) => {
  const categoryLabels: Record<string, string> = {
    'corte': 'Cortes',
    'coloracao': 'Coloração',
    'tratamento': 'Tratamentos',
    'finalizacao': 'Finalização',
    'outros': 'Outros'
  };

  const hasActiveFilters = searchTerm || selectedCategory;

  const handleCategoryChange = (value: string) => {
    // Convert "all" back to empty string for the parent component
    onCategoryChange(value === "all" ? "" : value);
  };

  // Filter out any empty string categories and ensure we have valid values
  const validCategories = categories.filter(category => category && category.trim() !== '');

  return (
    <Card className="glass-card border-salon-gold/20 mb-4">
      <CardContent className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-salon-copper" size={18} />
          <Input
            placeholder="Pesquisar serviços..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass-card border-salon-gold/30 bg-transparent text-white h-12"
          />
        </div>

        {/* Category Filter and Clear Button */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                <Filter size={18} className="text-salon-copper mr-2" />
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent className="bg-salon-dark border-salon-gold/30">
                <SelectItem value="all">Todas as categorias</SelectItem>
                {validCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category] || category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12 px-4"
            >
              <X size={16} className="mr-2" />
              Limpar
            </Button>
          )}
        </div>

        {/* Results Counter */}
        <div className="text-sm text-salon-copper">
          {hasActiveFilters ? (
            <span>{totalResults} serviço{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}</span>
          ) : (
            <span>{totalResults} serviço{totalResults !== 1 ? 's' : ''} disponíve{totalResults !== 1 ? 'is' : 'l'}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceFilters;
