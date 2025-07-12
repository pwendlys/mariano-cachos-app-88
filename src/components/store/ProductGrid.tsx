
import React from 'react';
import { Star, Package } from 'lucide-react';
import { SupabaseProduct } from '@/hooks/useSupabaseProducts';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: SupabaseProduct[];
  viewMode: 'grid' | 'list';
  selectedCategory: string;
  favorites: string[];
  quantities: Record<string, number>;
  onToggleFavorite: (productId: string) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onAddToCart: (product: SupabaseProduct) => void;
  getProductQuantity: (productId: string) => number;
}

const ProductGrid = ({
  products,
  viewMode,
  selectedCategory,
  favorites,
  quantities,
  onToggleFavorite,
  onUpdateQuantity,
  onAddToCart,
  getProductQuantity,
}: ProductGridProps) => {
  const recommendedProducts = products.slice(0, 4);

  return (
    <div className="space-y-4">
      {selectedCategory === 'all' && recommendedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-salon-gold flex items-center gap-2">
            <Star className="text-salon-gold fill-current" size={20} />
            Produtos em destaque
          </h2>
          
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                favorites={favorites}
                quantities={quantities}
                onToggleFavorite={onToggleFavorite}
                onUpdateQuantity={onUpdateQuantity}
                onAddToCart={onAddToCart}
                getProductQuantity={getProductQuantity}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {selectedCategory === 'all' && recommendedProducts.length > 0 && (
          <h2 className="text-lg font-semibold text-salon-gold">Todos os Produtos</h2>
        )}
        
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              favorites={favorites}
              quantities={quantities}
              onToggleFavorite={onToggleFavorite}
              onUpdateQuantity={onUpdateQuantity}
              onAddToCart={onAddToCart}
              getProductQuantity={getProductQuantity}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
