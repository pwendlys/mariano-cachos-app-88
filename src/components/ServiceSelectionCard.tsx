
import React from 'react';
import { Clock, Check, Plus, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  categoria: string;
  imagem?: string | null;
  detalhes?: string | null;
}

interface ServiceSelectionCardProps {
  service: Service;
  isSelected: boolean;
  onToggle: (serviceId: string) => void;
  disabled?: boolean;
}

const ServiceSelectionCard: React.FC<ServiceSelectionCardProps> = ({
  service,
  isSelected,
  onToggle,
  disabled = false
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      corte: 'bg-blue-500/20 text-blue-400',
      coloracao: 'bg-purple-500/20 text-purple-400', 
      tratamento: 'bg-green-500/20 text-green-400',
      finalizacao: 'bg-orange-500/20 text-orange-400',
      outros: 'bg-gray-500/20 text-gray-400'
    };
    return colors[categoria as keyof typeof colors] || colors.outros;
  };

  return (
    <Card 
      className={`glass-card cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-salon-gold bg-salon-gold/10 shadow-lg shadow-salon-gold/20' 
          : 'border-salon-gold/20 hover:border-salon-gold/40 hover:bg-salon-gold/5'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onToggle(service.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Service Image */}
          <div className="flex-shrink-0">
            {service.imagem ? (
              <img 
                src={service.imagem} 
                alt={service.nome}
                className="w-16 h-16 object-cover rounded-lg border border-salon-gold/30"
              />
            ) : (
              <div className="w-16 h-16 bg-salon-gold/10 rounded-lg border border-salon-gold/30 flex items-center justify-center">
                <Image className="text-salon-gold/40" size={20} />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white text-lg leading-tight">
                {service.nome}
              </h3>
              <div className="ml-2 flex-shrink-0">
                {isSelected ? (
                  <div className="w-6 h-6 bg-salon-gold rounded-full flex items-center justify-center">
                    <Check className="text-salon-dark" size={16} />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-salon-gold/60 rounded-full flex items-center justify-center hover:border-salon-gold">
                    <Plus className="text-salon-gold/60" size={16} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-salon-gold font-bold text-xl">
                R$ {service.preco.toFixed(2)}
              </span>
              <div className="flex items-center space-x-1 text-salon-copper">
                <Clock size={16} />
                <span className="text-sm font-medium">{formatDuration(service.duracao)}</span>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`${getCategoryColor(service.categoria)} border-0 text-xs font-medium capitalize mb-3`}
            >
              {service.categoria}
            </Badge>

            {/* Detalhes field - displayed below the selected area */}
            {service.detalhes && (
              <div className="mt-3 pt-3 border-t border-salon-gold/20">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {service.detalhes}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceSelectionCard;
