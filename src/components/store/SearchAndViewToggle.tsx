
import React from 'react';
import { Search, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchAndViewToggleProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const SearchAndViewToggle = ({ 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode 
}: SearchAndViewToggleProps) => {
  return (
    <div className="flex space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 glass-card border-salon-gold/30 bg-transparent text-white placeholder:text-muted-foreground focus:border-salon-gold h-12"
        />
      </div>
      
      <div className="flex space-x-1 bg-salon-dark/50 rounded-lg p-1">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="icon"
          className={`h-10 w-10 ${
            viewMode === 'grid'
              ? 'bg-salon-gold text-salon-dark hover:bg-salon-copper'
              : 'text-salon-gold hover:bg-salon-gold/10'
          }`}
          onClick={() => setViewMode('grid')}
        >
          <Grid3X3 size={20} />
        </Button>
        
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="icon"
          className={`h-10 w-10 ${
            viewMode === 'list'
              ? 'bg-salon-gold text-salon-dark hover:bg-salon-copper'
              : 'text-salon-gold hover:bg-salon-gold/10'
          }`}
          onClick={() => setViewMode('list')}
        >
          <List size={20} />
        </Button>
      </div>
    </div>
  );
};

export default SearchAndViewToggle;
