
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useSharedCart } from '@/hooks/useSharedCart';
import ProductCard from '@/components/ProductCard';
import { Package, Grid, List } from 'lucide-react';

const ProductsForSale = () => {
  const { products, loading } = useSupabaseProducts('ecommerce');
  const { addToCart, toggleFavorite, favorites } = useSharedCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAddToCart = (product: any, quantity: number) => {
    addToCart(product, quantity);
  };

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId);
  };

  if (loading) {
    return (
      <Card className="glass-card border-salon-gold/20">
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-salon-gold border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Package size={20} />
            Produtos à Venda
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-salon-gold border-salon-gold/30">
              {products.length} produtos
            </Badge>
            <div className="flex items-center gap-1 bg-salon-dark/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 w-8 p-0 ${
                  viewMode === 'grid' 
                    ? 'bg-salon-gold/20 text-salon-gold' 
                    : 'text-muted-foreground hover:text-salon-gold'
                }`}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 w-8 p-0 ${
                  viewMode === 'list' 
                    ? 'bg-salon-gold/20 text-salon-gold' 
                    : 'text-muted-foreground hover:text-salon-gold'
                }`}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum produto disponível para venda no momento.
            </p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-4'
          }`}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsForSale;
