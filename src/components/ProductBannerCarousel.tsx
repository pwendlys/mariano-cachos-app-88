import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { Product } from '@/hooks/useSupabaseProducts';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductBannerCarouselProps {
  onAddToCart: (product: Product, quantity: number) => void;
  autoRotate?: boolean;
  rotateInterval?: number;
}

const ProductBannerCarousel = ({ 
  onAddToCart, 
  autoRotate = true, 
  rotateInterval = 5000 
}: ProductBannerCarouselProps) => {
  const { featuredProducts, loading } = useFeaturedProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!autoRotate || isPaused || featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, isPaused, featuredProducts.length, rotateInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? featuredProducts.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart(product, 1);
  };

  if (loading) {
    return (
      <div className="w-full h-48 bg-salon-dark/20 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-salon-gold">Carregando produtos em destaque...</div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  const currentProduct = featuredProducts[currentIndex];
  
  // Priorizar imagem de banner personalizada sobre imagem do produto
  const backgroundImage = currentProduct.bannerImage || currentProduct.image;

  return (
    <div 
      className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background com gradiente e imagem personalizada */}
      <div className="absolute inset-0 bg-gradient-to-r from-salon-dark/95 via-salon-purple/70 to-salon-dark/95" />
      
      {/* Imagem de fundo personalizada ou do produto */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            opacity: currentProduct.bannerImage ? 0.4 : 0.3 // Menos opacidade para banner personalizado
          }}
        />
      )}

      {/* Overlay adicional para garantir legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

      {/* Conteúdo do slide */}
      <div className="relative h-full flex items-center p-3 sm:p-6 lg:p-8 z-10">
        <div className="flex items-center space-x-3 sm:space-x-6 w-full">
          {/* Imagem do produto */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-salon-gold/30">
              {currentProduct.image ? (
                <img 
                  src={currentProduct.image} 
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-salon-gold" size={isMobile ? 24 : 32} />
                </div>
              )}
            </div>
          </div>

          {/* Informações do produto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Star className="text-salon-gold fill-current" size={14} />
              <span className="text-salon-gold text-xs sm:text-sm font-medium">Produto em Destaque</span>
            </div>
            
            <h3 className="text-white text-lg sm:text-2xl font-bold mb-1 line-clamp-1 drop-shadow-lg">
              {currentProduct.name}
            </h3>
            
            <p className="text-salon-copper text-xs sm:text-sm mb-1 sm:mb-2 drop-shadow">{currentProduct.brand}</p>
            
            {currentProduct.description && (
              <p className="text-white/90 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 hidden sm:block drop-shadow">
                {currentProduct.description}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <span className="text-salon-gold text-xl sm:text-2xl font-bold drop-shadow-lg">
                  R$ {currentProduct.price.toFixed(2)}
                </span>
                <span className="text-white/70 text-xs sm:text-sm drop-shadow hidden xs:block">
                  Estoque: {currentProduct.stock}
                </span>
              </div>
              
              <Button
                onClick={() => handleAddToCart(currentProduct)}
                className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-8 sm:h-10 px-3 sm:px-6 shadow-lg text-xs sm:text-sm"
                disabled={currentProduct.stock === 0}
              >
                <ShoppingCart size={14} className="mr-1 sm:mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de navegação */}
      {featuredProducts.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-salon-gold w-6' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductBannerCarousel;
