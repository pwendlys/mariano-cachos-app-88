
import React from 'react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }: CategoryFilterProps) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          className={`whitespace-nowrap h-12 ${
            selectedCategory === category.id 
              ? 'bg-salon-gold text-salon-dark hover:bg-salon-copper' 
              : 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10'
          }`}
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.name} ({category.count})
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
