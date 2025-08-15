import React from 'react';
import { Calendar, ShoppingBag, Star, Sparkles, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSupabaseBannerSettings } from '@/hooks/useSupabaseBannerSettings';
import { useSharedServices } from '@/hooks/useSharedServices';
import ClientGalleryCarousel from '@/components/ClientGalleryCarousel';

const Index = () => {
  const navigate = useNavigate();
  const { banner } = useSupabaseBannerSettings();
  const { services } = useSharedServices();

  const testimonials = [
    {
      name: 'Camila Santos',
      text: 'Marcos transformou completamente meu cabelo! Agora ele tem vida própria.',
      rating: 5
    },
    {
      name: 'Juliana Costa',
      text: 'Melhor profissional que já conheci. Entende tudo de cabelo crespo!',
      rating: 5
    }
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('corte')) return '✂️';
    if (serviceName.toLowerCase().includes('hidratação')) return '💧';
    if (serviceName.toLowerCase().includes('coloração') || serviceName.toLowerCase().includes('cor')) return '🎨';
    if (serviceName.toLowerCase().includes('finalização')) return '✨';
    return '💅';
  };

  const bgUrl = banner.imageUrl || banner.image || '';
  const logoUrl = banner.logoUrl || banner.logo || '';
  const crop = banner.imageMeta?.crop || { x: 0, y: 0 };
  const zoom = banner.imageMeta?.zoom || 1;

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      {/* Banner Principal Personalizável */}
      {banner.isVisible && (
        <div className="relative overflow-hidden rounded-3xl glass-card p-6 text-center min-h-[200px]">
          {bgUrl && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <img 
                src={bgUrl} 
                alt="Banner Background" 
                className="w-full h-full object-cover opacity-30"
                style={{
                  transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                  transformOrigin: 'center center'
                }}
              />
            </div>
          )}
          <div className="absolute inset-0 gradient-gold opacity-10"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full ring-2 ring-salon-gold overflow-hidden">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src="/lovable-uploads/9554bba6-92bb-44cc-ba87-b689b0542615.png" 
                  alt="Marcos Mariano Logo" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
              {banner.title}
            </h1>
            <p className="text-salon-copper font-medium mb-4">
              {banner.subtitle}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              "{banner.description}"
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate('/agendamento')} 
          className="h-20 bg-gradient-to-r from-salon-gold to-salon-copper hover:from-salon-copper hover:to-salon-gold text-salon-dark font-semibold rounded-2xl flex flex-col space-y-1"
        >
          <Calendar size={24} />
          <span>Agendar Horário</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/loja')} 
          variant="outline" 
          className="h-20 border-salon-gold text-salon-gold hover:bg-salon-gold/10 rounded-2xl flex flex-col space-y-1"
        >
          <ShoppingBag size={24} />
          <span>Nossos Produtos</span>
        </Button>
      </div>

      {/* Banner Rotativo de Fotos de Atendimentos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gradient-gold font-playfair">
            Nossos Atendimentos
          </h2>
          <Sparkles className="text-salon-gold" size={24} />
        </div>
        
        <ClientGalleryCarousel />
      </div>

      {/* Depoimentos */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gradient-gold font-playfair flex items-center gap-2">
          <Star className="text-salon-gold" size={24} />
          O que dizem sobre nós
        </h2>
        
        <div className="space-y-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-card border-salon-purple/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-salon-gold fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-2">"{testimonial.text}"</p>
                <p className="text-salon-gold font-medium text-sm">- {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card border-salon-gold/20 text-center">
          <CardContent className="p-4">
            <Users className="mx-auto text-salon-gold mb-2" size={24} />
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-xs text-muted-foreground">Clientes Felizes</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-salon-gold/20 text-center">
          <CardContent className="p-4">
            <Award className="mx-auto text-salon-gold mb-2" size={24} />
            <p className="text-2xl font-bold text-white">5+</p>
            <p className="text-xs text-muted-foreground">Anos de Experiência</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-salon-gold/20 text-center">
          <CardContent className="p-4">
            <Star className="mx-auto text-salon-gold mb-2" size={24} />
            <p className="text-2xl font-bold text-white">4.9</p>
            <p className="text-xs text-muted-foreground">Avaliação Média</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
