
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, MessageSquare, Check, Plus, Image, AlertCircle } from 'lucide-react';
import { useSupabaseScheduling } from '@/hooks/useSupabaseScheduling';
import { useProfessionals } from '@/hooks/useProfessionals';

interface SchedulingStepsProps {
  currentStep: number;
  selectedServices: string[];
  selectedProfessional: string;
  selectedDate: string;
  selectedTime: string;
  clientName: string;
  clientPhone: string;
  observations: string;
  onServiceToggle: (serviceId: string) => void;
  onProfessionalSelect: (professionalId: string) => void;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onClientNameChange: (name: string) => void;
  onClientPhoneChange: (phone: string) => void;
  onObservationsChange: (observations: string) => void;
}

const SchedulingSteps: React.FC<SchedulingStepsProps> = ({
  currentStep,
  selectedServices,
  selectedProfessional,
  selectedDate,
  selectedTime,
  clientName,
  clientPhone,
  observations,
  onServiceToggle,
  onProfessionalSelect,
  onDateSelect,
  onTimeSelect,
  onClientNameChange,
  onClientPhoneChange,
  onObservationsChange,
}) => {
  const { services, loading, getSlotStatus } = useSupabaseScheduling();
  const { getActiveProfessionals } = useProfessionals();

  console.log('🔄 [SchedulingSteps] Current services count:', services.length);
  console.log('🔄 [SchedulingSteps] Loading state:', loading);

  const activeProfessionals = getActiveProfessionals();

  const baseAvailableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const getTotalDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duracao || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.preco || 0);
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const getCategoryLabel = (categoria: string) => {
    const categoryLabels: Record<string, string> = {
      'corte': 'Corte',
      'coloracao': 'Coloração',
      'tratamento': 'Tratamento',
      'finalizacao': 'Finalização',
      'outros': 'Outros'
    };
    return categoryLabels[categoria] || categoria;
  };

  const getSelectedServicesDetails = () => {
    return services.filter(s => selectedServices.includes(s.id));
  };

  const getSelectedProfessionalDetails = () => {
    return activeProfessionals.find(p => p.id === selectedProfessional);
  };

  const getTimeSlotButtonClass = (time: string) => {
    if (!selectedDate) {
      return 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10';
    }

    const status = getSlotStatus(selectedDate, time);
    
    if (selectedTime === time) {
      return 'bg-salon-gold text-salon-dark hover:bg-salon-copper';
    }
    
    switch (status) {
      case 'ocupado':
        return 'bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30';
      case 'pendente':
        return 'bg-yellow-600/20 border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/30';
      default:
        return 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10';
    }
  };

  const canSelectTime = (time: string) => {
    if (!selectedDate || selectedServices.length === 0) return false;
    
    const totalDuration = getTotalDuration();
    const status = getSlotStatus(selectedDate, time);
    
    return status === 'livre' && totalDuration > 0;
  };

  const getTimeSlotLabel = (time: string) => {
    if (!selectedDate) return time;
    
    const status = getSlotStatus(selectedDate, time);
    switch (status) {
      case 'ocupado':
        return `${time} (Ocupado)`;
      case 'pendente':
        return `${time} (Aguardando)`;
      default:
        return time;
    }
  };

  // Step 1: Select Services
  if (currentStep === 1) {
    return (
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <User size={20} />
            Escolha seus Serviços
            {selectedServices.length > 0 && (
              <span className="text-sm text-salon-copper">
                ({selectedServices.length} selecionado{selectedServices.length > 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
          {selectedServices.length > 0 && (
            <div className="text-sm text-salon-copper flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Você pode selecionar múltiplos serviços para o mesmo agendamento</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && services.length === 0 ? (
            <div className="text-center p-8 text-salon-gold">
              <p>Carregando serviços...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>Nenhum serviço disponível no momento.</p>
              <p className="text-sm mt-2">Entre em contato com o administrador.</p>
            </div>
          ) : (
            services.filter(service => service.ativo).map((service) => (
              <div
                key={service.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? 'border-salon-gold bg-salon-gold/10'
                    : 'border-salon-gold/20 hover:border-salon-gold/40'
                }`}
                onClick={() => onServiceToggle(service.id)}
              >
                <div className="flex items-center space-x-4 mb-2">
                  {service.imagem ? (
                    <img 
                      src={service.imagem} 
                      alt={service.nome}
                      className="w-16 h-16 object-cover rounded-lg border border-salon-gold/30 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-salon-gold/10 rounded-lg border border-salon-gold/30 flex items-center justify-center flex-shrink-0">
                      <Image className="text-salon-gold/40" size={20} />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-lg">{service.nome}</h3>
                      {selectedServices.includes(service.id) ? (
                        <Check className="text-salon-gold" size={20} />
                      ) : (
                        <Plus className="text-salon-gold/60" size={20} />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-salon-gold font-bold text-lg">R$ {service.preco.toFixed(2)}</span>
                      <div className="flex items-center space-x-1 text-salon-copper">
                        <Clock size={16} />
                        <span className="text-sm">{formatDuration(service.duracao)}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-salon-copper">{getCategoryLabel(service.categoria)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {selectedServices.length > 0 && (
            <div className="mt-6 p-4 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
              <h4 className="text-salon-gold font-medium mb-2">Resumo dos Serviços:</h4>
              <div className="space-y-1 text-sm">
                {getSelectedServicesDetails().map(service => (
                  <div key={service.id} className="flex justify-between text-white">
                    <span>{service.nome}</span>
                    <span>R$ {service.preco.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-salon-gold/30">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-salon-copper" />
                  <span className="text-salon-copper">{formatDuration(getTotalDuration())}</span>
                </div>
                <span className="text-salon-gold font-bold text-lg">
                  Total: R$ {getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Step 2: Select Professional
  if (currentStep === 2) {
    return (
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <User size={20} />
            Escolha seu Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeProfessionals.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              Nenhum profissional ativo disponível no momento.
            </div>
          ) : (
            activeProfessionals.map((professional) => (
              <div
                key={professional.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProfessional === professional.id
                    ? 'border-salon-gold bg-salon-gold/10'
                    : 'border-salon-gold/20 hover:border-salon-gold/40'
                }`}
                onClick={() => onProfessionalSelect(professional.id)}
              >
                <div className="flex items-center space-x-4">
                  {professional.avatar ? (
                    <img 
                      src={professional.avatar} 
                      alt={professional.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-salon-gold/20 rounded-full flex items-center justify-center">
                      <User className="text-salon-gold" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{professional.name}</h3>
                    <p className="text-salon-copper text-sm">
                      {professional.specialties.join(', ')}
                    </p>
                    <p className="text-muted-foreground text-xs">{professional.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  // Step 3: Select Date
  if (currentStep === 3) {
    return (
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Calendar size={20} />
            Escolha a Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateSelect(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="glass-card border-salon-gold/30 bg-transparent text-white h-14 text-lg"
          />
        </CardContent>
      </Card>
    );
  }

  // Step 4: Select Time - Showing all slots with status
  if (currentStep === 4) {
    return (
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Clock size={20} />
            Escolha o Horário
            {selectedServices.length > 0 && (
              <span className="text-sm text-salon-copper ml-2">
                ({formatDuration(getTotalDuration())})
              </span>
            )}
          </CardTitle>
          <div className="text-sm text-salon-copper mt-2">
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-salon-gold/30 border border-salon-gold/50 rounded"></div>
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-600/30 border border-yellow-600/50 rounded"></div>
                <span>Aguardando Aprovação</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600/30 border border-red-600/50 rounded"></div>
                <span>Ocupado</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {baseAvailableTimes.map((time) => {
              const canSelect = canSelectTime(time);
              const buttonClass = getTimeSlotButtonClass(time);
              const label = getTimeSlotLabel(time);
              
              return (
                <Button
                  key={time}
                  variant="outline"
                  className={`h-14 text-sm transition-all ${buttonClass}`}
                  onClick={() => canSelect ? onTimeSelect(time) : null}
                  disabled={!canSelect}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 5: Contact Info and Confirmation
  if (currentStep === 5) {
    return (
      <div className="space-y-6">
        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-salon-gold flex items-center gap-2">
              <MessageSquare size={20} />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Nome Completo *</label>
              <Input
                value={clientName}
                onChange={(e) => onClientNameChange(e.target.value)}
                placeholder="Seu nome completo"
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white">WhatsApp *</label>
              <Input
                value={clientPhone}
                onChange={(e) => onClientPhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Observações</label>
              <Textarea
                value={observations}
                onChange={(e) => onObservationsChange(e.target.value)}
                placeholder="Alguma observação especial sobre seu atendimento?"
                className="glass-card border-salon-gold/30 bg-transparent text-white"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-salon-gold">Resumo do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-muted-foreground">Serviços:</span>
              <div className="mt-1 space-y-1">
                {getSelectedServicesDetails().map(service => (
                  <div key={service.id} className="flex justify-between text-white text-sm">
                    <span>{service.nome}</span>
                    <span>R$ {service.preco.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profissional:</span>
              <span className="text-white font-medium">{getSelectedProfessionalDetails()?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span className="text-white font-medium">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horário:</span>
              <span className="text-white font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duração:</span>
              <span className="text-white font-medium">{formatDuration(getTotalDuration())}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-salon-gold/30">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="text-salon-gold font-bold text-xl">
                R$ {getTotalPrice().toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default SchedulingSteps;
