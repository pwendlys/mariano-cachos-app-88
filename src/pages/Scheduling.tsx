
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseScheduling } from '@/hooks/useSupabaseScheduling';
import { useScheduling } from '@/hooks/useScheduling';
import SchedulingSteps from '@/components/SchedulingSteps';

const Scheduling = () => {
  const { toast } = useToast();
  const { services, loading, createMultipleAppointments } = useSupabaseScheduling();
  const { addAppointment, isSlotAvailable } = useScheduling();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [observations, setObservations] = useState('');

  console.log('🔄 [Scheduling] Component rendered with services count:', services.length);
  console.log('🔄 [Scheduling] Loading state:', loading);

  const getTotalDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duracao || 0);
    }, 0);
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

  const handleConfirmBooking = async () => {
    console.log('📅 [Scheduling] Confirming booking with data:', {
      selectedServices,
      selectedProfessional,
      selectedDate,
      selectedTime,
      clientName,
      clientPhone,
      observations
    });

    if (selectedServices.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um serviço",
        variant: "destructive"
      });
      return;
    }

    const success = await createMultipleAppointments({
      serviceIds: selectedServices,
      data: selectedDate,
      horario: selectedTime,
      clientName,
      clientEmail: `${clientPhone}@temp.com`, // Email temporário baseado no telefone
      clientPhone,
      observacoes: observations
    });

    if (success) {
      // Reset form
      setCurrentStep(1);
      setSelectedServices([]);
      setSelectedProfessional('');
      setSelectedDate('');
      setSelectedTime('');
      setClientName('');
      setClientPhone('');
      setObservations('');
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="px-4 space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
            Agende Seu Horário
          </h1>
          <p className="text-muted-foreground">
            Carregando serviços...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
          Agende Seu Horário
        </h1>
        <p className="text-muted-foreground">
          Escolha múltiplos serviços para o melhor cuidado dos seus cachos
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

      {/* Scheduling Steps Component */}
      <SchedulingSteps
        currentStep={currentStep}
        selectedServices={selectedServices}
        selectedProfessional={selectedProfessional}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        clientName={clientName}
        clientPhone={clientPhone}
        observations={observations}
        onServiceToggle={handleServiceToggle}
        onProfessionalSelect={setSelectedProfessional}
        onDateSelect={setSelectedDate}
        onTimeSelect={setSelectedTime}
        onClientNameChange={setClientName}
        onClientPhoneChange={setClientPhone}
        onObservationsChange={setObservations}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-between space-x-4 pb-8">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            className="flex-1 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-14"
            disabled={loading}
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
              (currentStep === 4 && !selectedTime) ||
              loading
            }
            className={`${currentStep === 1 ? 'w-full' : 'flex-1'} bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-14`}
          >
            Continuar
          </Button>
        )}
        
        {currentStep === 5 && (
          <Button
            onClick={handleConfirmBooking}
            disabled={!clientName || !clientPhone || loading}
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
