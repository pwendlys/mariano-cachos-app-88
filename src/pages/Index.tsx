
import React from 'react';
import { Calendar, ShoppingBag, Star, Sparkles, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBannerSettings } from '@/hooks/useBannerSettings';
import { useSharedServices } from '@/hooks/useSharedServices';

const Index = () => {
  const navigate = useNavigate();
  const { bannerSettings } = useBannerSettings();
  const { services } = useSharedServices();

  const testimonials = [
    {
      name: 'Camila Santos',
      text: 'Marcos transformou completamente meu cabelo! Agora ele tem vida própria.',
      rating: 5,
    },
    {
      name: 'Juliana Costa',
      text: 'Melhor profissional que já conheci. Entende tudo de cabelo crespo!',
      rating: 5,
    },
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

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      {/* Banner Principal Personalizável */}
      {bannerSettings.isVisible && (
        <div className="relative overflow-hidden rounded-3xl glass-card p-6 text-center">
          {bannerSettings.image && (
            <div className="absolute inset-0">
              <img 
                src={bannerSettings.image} 
                alt="Banner Background" 
                className="w-full h-full object-cover rounded-3xl opacity-30"
              />
            </div>
          )}
          <div className="absolute inset-0 gradient-gold opacity-10"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-gold p-1">
              <div className="w-full h-full rounded-full bg-salon-dark flex items-center justify-center">
                {bannerSettings.logo ? (
                  <img 
                    src={bannerSettings.logo} 
                    alt="Logo" 
                    className="w-20 h-20 object-contain rounded-full"
                  />
                ) : (
                  <img 
                    src="/lovable-uploads/6c513fb2-7005-451a-bfba-cb471f2086a3.png" 
                    alt="Marcos Mariano Logo" 
                    className="w-20 h-20 object-contain rounded-full"
                  />
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
              {bannerSettings.title}
            </h1>
            <p className="text-salon-copper font-medium mb-4">
              {bannerSettings.subtitle}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              "{bannerSettings.description}"
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

      {/* Serviços Especializados - Agora dinâmicos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gradient-gold font-playfair">
            Serviços Especializados
          </h2>
          <Sparkles className="text-salon-gold" size={24} />
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {services.map((service) => (
            <Card key={service.id} className="glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-all duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">{getServiceIcon(service.name)}</span>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatDuration(service.duration)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-salon-gold font-bold">R$ {service.price.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
