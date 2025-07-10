
import React, { useState } from 'react';
import { Calendar, Clock, User, MessageSquare, Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSharedServices } from '@/hooks/useSharedServices';
import { useScheduling } from '@/hooks/useScheduling';
import { useProfessionals } from '@/hooks/useProfessionals';

const Scheduling = () => {
  const { toast } = useToast();
  const { services } = useSharedServices();
  const { addAppointment, isSlotAvailable } = useScheduling();
  const { getActiveProfessionals } = useProfessionals();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [observations, setObservations] = useState('');

  // Get only active professionals
  const activeProfessionals = getActiveProfessionals();

  const baseAvailableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const getTotalDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const getAvailableTimes = () => {
    if (!selectedDate || !selectedProfessional || selectedServices.length === 0) {
      return baseAvailableTimes;
    }

    const totalDuration = getTotalDuration();

    return baseAvailableTimes.filter(time => 
      isSlotAvailable(selectedDate, time, selectedProfessional, totalDuration)
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    const totalDuration = getTotalDuration();

    const newAppointment = {
      id: Date.now().toString(),
      serviceIds: selectedServices,
      professionalId: selectedProfessional,
      date: selectedDate,
      time: selectedTime,
      duration: totalDuration,
      clientName,
      clientPhone,
      observations
    };

    addAppointment(newAppointment);

    toast({
      title: "Agendamento confirmado! ✨",
      description: "Você receberá uma confirmação por WhatsApp em breve.",
    });
    
    // Reset form
    setCurrentStep(1);
    setSelectedServices([]);
    setSelectedProfessional('');
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setObservations('');
  };

  const getSelectedServicesDetails = () => {
    return services.filter(s => selectedServices.includes(s.id));
  };

  const getSelectedProfessionalDetails = () => {
    return activeProfessionals.find(p => p.id === selectedProfessional);
  };

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
          Agende Seu Horário
        </h1>
        <p className="text-muted-foreground">
          Escolha o melhor momento para cuidar dos seus cachos
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === currentStep
                  ? 'bg-salon-gold text-salon-dark'
                  : step < currentStep
                  ? 'bg-salon-gold/50 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step < currentStep ? <Check size={16} /> : step}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Services */}
      {currentStep === 1 && (
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
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? 'border-salon-gold bg-salon-gold/10'
                    : 'border-salon-gold/20 hover:border-salon-gold/40'
                }`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <div className="flex items-start space-x-4">
                  {service.image && (
                    <div className="flex-shrink-0">
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white text-lg">{service.name}</h3>
                      {selectedServices.includes(service.id) ? (
                        <Check className="text-salon-gold" size={20} />
                      ) : (
                        <Plus className="text-salon-gold/60" size={20} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-salon-gold font-bold text-lg">R$ {service.price.toFixed(2)}</span>
                      <div className="flex items-center space-x-1 text-salon-copper">
                        <Clock size={16} />
                        <span className="text-sm">{formatDuration(service.duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {selectedServices.length > 0 && (
              <div className="mt-6 p-4 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
                <h4 className="text-salon-gold font-medium mb-2">Resumo dos Serviços:</h4>
                <div className="space-y-1 text-sm">
                  {getSelectedServicesDetails().map(service => (
                    <div key={service.id} className="flex justify-between text-white">
                      <span>{service.name}</span>
                      <span>R$ {service.price.toFixed(2)}</span>
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
      )}

      {/* Step 2: Select Professional */}
      {currentStep === 2 && (
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
                  onClick={() => setSelectedProfessional(professional.id)}
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
      )}

      {/* Step 3: Select Date */}
      {currentStep === 3 && (
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
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="glass-card border-salon-gold/30 bg-transparent text-white h-14 text-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Select Time */}
      {currentStep === 4 && (
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {getAvailableTimes().map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={`h-14 text-lg ${
                    selectedTime === time
                      ? 'bg-salon-gold text-salon-dark hover:bg-salon-copper'
                      : 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10'
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
              {getAvailableTimes().length === 0 && (
                <div className="col-span-3 text-center p-4 text-muted-foreground">
                  Não há horários disponíveis para esta data. Tente outra data.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Contact Info and Confirmation */}
      {currentStep === 5 && (
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
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">WhatsApp *</label>
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Observações</label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Alguma observação especial sobre seu atendimento?"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
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
                      <span>{service.name}</span>
                      <span>R$ {service.price.toFixed(2)}</span>
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
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between space-x-4 pb-8">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            className="flex-1 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-14"
          >
            Voltar
          </Button>
        )}
        
        {currentStep < 5 && (
          <Button
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && selectedServices.length === 0) ||
              (currentStep === 2 && !selectedProfessional) ||
              (currentStep === 3 && !selectedDate) ||
              (currentStep === 4 && !selectedTime)
            }
            className={`${currentStep === 1 ? 'w-full' : 'flex-1'} bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-14`}
          >
            Continuar
          </Button>
        )}
        
        {currentStep === 5 && (
          <Button
            onClick={handleConfirmBooking}
            disabled={!clientName || !clientPhone}
            className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-14"
          >
            Confirmar Agendamento
          </Button>
        )}
      </div>
    </div>
  );
};

export default Scheduling;
