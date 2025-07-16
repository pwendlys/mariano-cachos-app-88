
import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Minus, Plus, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/hooks/useSupabaseProducts';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
}

const ProductCard = ({ 
  product, 
  viewMode, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite 
}: ProductCardProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    try {
      onAddToCart(product, quantity);
      toast({
        title: "Produto adicionado! 🛒",
        description: `${quantity}x ${product.name} adicionado ao carrinho.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = (change: number) => {
    const newQty = Math.max(1, Math.min(product.stock, quantity + change));
    setQuantity(newQty);
  };

  return (
    <Card className={`glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-all duration-300 group ${
      viewMode === 'list' ? 'w-full' : ''
    }`}>
      <CardContent className="p-4">
        <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-3'}`}>
          <div className={`relative ${viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'mb-3'}`}>
            <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'aspect-square'} bg-gradient-to-br from-salon-gold/20 to-salon-copper/20 rounded-lg overflow-hidden`}>
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-salon-gold" size={32} />
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 ${viewMode === 'list' ? 'w-6 h-6' : ''}`}
              onClick={() => onToggleFavorite(product.id)}
            >
              <Heart 
                size={viewMode === 'list' ? 12 : 16} 
                className={isFavorite ? 'text-red-500 fill-current' : 'text-white'} 
              />
            </Button>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">Esgotado</span>
              </div>
            )}
          </div>

          <div className={`${viewMode === 'list' ? 'flex-1' : 'space-y-2'}`}>
            <div className={viewMode === 'list' ? 'flex items-start justify-between' : 'space-y-2'}>
              <div className={viewMode === 'list' ? 'flex-1 pr-4' : ''}>
                <h3 className={`font-semibold text-white ${viewMode === 'list' ? 'text-base' : 'text-sm'} line-clamp-2`}>
                  {product.name}
                </h3>
                <p className={`${viewMode === 'list' ? 'text-sm' : 'text-xs'} text-salon-copper`}>
                  {product.brand}
                </p>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-salon-gold font-bold">R$ {product.price.toFixed(2)}</span>
                  {isLowStock && !isOutOfStock && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs">
                      <AlertTriangle size={10} className="mr-1" />
                      Baixo
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-1 mt-1">
                  <Package size={12} className="text-salon-gold" />
                  <span className="text-xs text-muted-foreground">
                    Estoque: {product.stock}
                  </span>
                </div>

                {viewMode === 'list' && product.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              <div className={`${viewMode === 'list' ? 'flex items-center space-x-2' : 'space-y-2'}`}>
                {!isOutOfStock && (
                  <div className="flex items-center space-x-1 bg-salon-dark/50 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-salon-gold hover:bg-salon-gold/20"
                      onClick={() => updateQuantity(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus size={12} />
                    </Button>
                    
                    <span className="text-white text-sm min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-salon-gold hover:bg-salon-gold/20"
                      onClick={() => updateQuantity(1)}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium ${
                    viewMode === 'list' ? 'h-10 px-6' : 'w-full text-sm h-12'
                  }`}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  {isOutOfStock ? 'Esgotado' : 'Adicionar'}
                </Button>
              </div>
            </div>

            {viewMode === 'grid' && product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
