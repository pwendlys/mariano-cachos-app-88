
import React from 'react';
import { Calendar, Clock, User, MapPin, CreditCard, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  categoria: string;
}

interface AppointmentSummaryCardProps {
  services: Service[];
  selectedServiceIds: string[];
  selectedDate: string;
  selectedTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  observations?: string;
  depositAmount: number;
}

const AppointmentSummaryCard: React.FC<AppointmentSummaryCardProps> = ({
  services,
  selectedServiceIds,
  selectedDate,
  selectedTime,
  clientName,
  clientEmail,
  clientPhone,
  observations,
  depositAmount
}) => {
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.preco, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duracao, 0);
  const remainingAmount = totalPrice - depositAmount;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hour, minute] = startTime.split(':').map(Number);
    const startTimeInMinutes = hour * 60 + minute;
    const endTimeInMinutes = startTimeInMinutes + duration;
    const endHour = Math.floor(endTimeInMinutes / 60);
    const endMinute = endTimeInMinutes % 60;
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold flex items-center gap-2">
          <FileText size={20} />
          Resumo do Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Services Section */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <MapPin size={16} />
            Serviços Selecionados ({selectedServices.length})
          </h4>
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-salon-dark/30 rounded-lg">
                <div>
                  <span className="text-white font-medium">{service.nome}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize bg-salon-gold/10 text-salon-copper border-salon-gold/30">
                      {service.categoria}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(service.duracao)}
                    </span>
                  </div>
                </div>
                <span className="text-salon-gold font-bold">R$ {service.preco.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-salon-gold/20" />

        {/* Date & Time Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-salon-copper font-medium mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Data
            </h4>
            <p className="text-white">{formatDate(selectedDate)}</p>
          </div>
          <div>
            <h4 className="text-salon-copper font-medium mb-2 flex items-center gap-2">
              <Clock size={16} />
              Horário
            </h4>
            <p className="text-white">
              {selectedTime} - {calculateEndTime(selectedTime, totalDuration)}
            </p>
            <p className="text-sm text-muted-foreground">Duração: {formatDuration(totalDuration)}</p>
          </div>
        </div>

        <Separator className="bg-salon-gold/20" />

        {/* Client Info Section */}
        <div>
          <h4 className="text-salon-copper font-medium mb-3 flex items-center gap-2">
            <User size={16} />
            Informações do Cliente
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span className="text-white font-medium">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-white">{clientEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">WhatsApp:</span>
              <span className="text-white">{clientPhone}</span>
            </div>
          </div>
        </div>

        {observations && (
          <>
            <Separator className="bg-salon-gold/20" />
            <div>
              <h4 className="text-salon-copper font-medium mb-2">Observações</h4>
              <p className="text-white text-sm bg-salon-dark/30 p-3 rounded-lg">{observations}</p>
            </div>
          </>
        )}

        <Separator className="bg-salon-gold/20" />

        {/* Financial Summary */}
        <div>
          <h4 className="text-salon-copper font-medium mb-3 flex items-center gap-2">
            <CreditCard size={16} />
            Resumo Financeiro
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valor Total dos Serviços:</span>
              <span className="text-white font-medium">R$ {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sinal (PIX):</span>
              <span className="text-salon-copper font-medium">R$ {depositAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-salon-gold/30">
              <span className="text-muted-foreground">Restante no dia:</span>
              <span className="text-salon-gold font-bold text-lg">R$ {remainingAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentSummaryCard;
