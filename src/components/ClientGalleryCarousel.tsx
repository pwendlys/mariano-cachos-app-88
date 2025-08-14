
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';

const ClientGalleryCarousel = () => {
  const { photos, loading } = useGalleryPhotos();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Filtrar apenas fotos ativas
  const activePhotos = photos.filter(photo => photo.is_active);

  const nextSlide = () => {
    if (activePhotos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activePhotos.length);
    }
  };

  const prevSlide = () => {
    if (activePhotos.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + activePhotos.length) % activePhotos.length);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-rotação
  useEffect(() => {
    if (isPlaying && activePhotos.length > 1) {
      const id = setInterval(nextSlide, 4000); // Troca a cada 4 segundos
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isPlaying, activePhotos.length]);

  // Pausar na hovering
  const handleMouseEnter = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && activePhotos.length > 1) {
      const id = setInterval(nextSlide, 4000);
      setIntervalId(id);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-salon-gold/20">
        <CardContent className="p-6 text-center">
          <div className="w-full h-64 bg-salon-purple/20 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-salon-copper">Carregando galeria...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activePhotos.length === 0) {
    return null; // Não renderiza nada se não há fotos
  }

  const currentPhoto = activePhotos[currentIndex];

  return (
    <Card 
      className="glass-card border-salon-gold/20 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0 relative">
        {/* Imagem Principal */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <img
            src={currentPhoto.image_url}
            alt={currentPhoto.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-salon-dark/80 via-transparent to-transparent" />
          
          {/* Controles de Navegação */}
          {activePhotos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-salon-dark/50 hover:bg-salon-gold/20 text-salon-gold border-salon-gold/30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-salon-dark/50 hover:bg-salon-gold/20 text-salon-gold border-salon-gold/30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              {/* Controle Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAutoPlay}
                className="absolute top-2 right-2 bg-salon-dark/50 hover:bg-salon-gold/20 text-salon-gold border-salon-gold/30"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </>
          )}
          
          {/* Título e Descrição */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-semibold text-salon-gold mb-1">
              {currentPhoto.title}
            </h3>
            {currentPhoto.description && (
              <p className="text-sm text-salon-copper opacity-90">
                {currentPhoto.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Indicadores */}
        {activePhotos.length > 1 && (
          <div className="flex justify-center space-x-2 py-3 bg-salon-dark/30">
            {activePhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-salon-gold w-6' 
                    : 'bg-salon-gold/30 hover:bg-salon-gold/50'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientGalleryCarousel;
