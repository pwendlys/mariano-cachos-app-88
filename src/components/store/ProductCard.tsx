
import React from 'react';
import { ShoppingCart, Heart, Star, Minus, Plus, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SupabaseProduct } from '@/hooks/useSupabaseProducts';

interface ProductCardProps {
  product: SupabaseProduct;
  viewMode: 'grid' | 'list';
  favorites: string[];
  quantities: Record<string, number>;
  onToggleFavorite: (productId: string) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onAddToCart: (product: SupabaseProduct) => void;
  getProductQuantity: (productId: string) => number;
}

const ProductCard = ({
  product,
  viewMode,
  favorites,
  quantities,
  onToggleFavorite,
  onUpdateQuantity,
  onAddToCart,
  getProductQuantity,
}: ProductCardProps) => {
  const isLowStock = product.estoque <= product.estoque_minimo;
  const isOutOfStock = product.estoque === 0;

  return (
    <Card className={`glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-all duration-300 group ${
      viewMode === 'list' ? 'w-full' : ''
    }`}>
      <CardContent className="p-4">
        <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-3'}`}>
          <div className={`relative ${viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'mb-3'}`}>
            <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'aspect-square'} bg-gradient-to-br from-salon-gold/20 to-salon-copper/20 rounded-lg overflow-hidden`}>
              {product.imagem ? (
                <img 
                  src={product.imagem} 
                  alt={product.nome}
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
                className={favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-white'} 
              />
            </Button>

            {isLowStock && !isOutOfStock && (
              <Badge className="absolute top-2 left-2 bg-orange-500/80 text-white text-xs">
                <AlertTriangle size={10} className="mr-1" />
                Baixo
              </Badge>
            )}

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
                  {product.nome}
                </h3>
                <p className={`${viewMode === 'list' ? 'text-sm' : 'text-xs'} text-salon-copper`}>
                  {product.marca}
                </p>
                
                <div className="flex items-center space-x-1 mt-1">
                  <Star size={12} className="text-salon-gold fill-current" />
                  <span className="text-xs text-muted-foreground">
                    4.8 (124)
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-salon-gold font-bold">R$ {product.preco.toFixed(2)}</span>
                </div>

                <div className="flex items-center space-x-1 mt-1">
                  <Package size={12} className="text-salon-gold" />
                  <span className="text-xs text-muted-foreground">
                    Estoque: {product.estoque}
                  </span>
                </div>

                {viewMode === 'list' && product.descricao && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {product.descricao}
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
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      disabled={getProductQuantity(product.id) <= 1}
                    >
                      <Minus size={12} />
                    </Button>
                    
                    <span className="text-white text-sm min-w-[2rem] text-center">
                      {getProductQuantity(product.id)}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-salon-gold hover:bg-salon-gold/20"
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      disabled={getProductQuantity(product.id) >= product.estoque}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                )}

                <Button
                  onClick={() => onAddToCart(product)}
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

            {viewMode === 'grid' && product.descricao && (
              <p className="text-xs text-muted-foreground line-clamp-2">{product.descricao}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
