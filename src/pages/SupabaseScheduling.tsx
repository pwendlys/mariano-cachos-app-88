
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MessageSquare, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseScheduling } from '@/hooks/useSupabaseScheduling';
import { useAuth } from '@/hooks/useAuth';
import PIXPaymentStep from '@/components/PIXPaymentStep';

const SupabaseScheduling = () => {
  const { services, createAppointment, isSlotAvailable, getSlotStatus, loading } = useSupabaseScheduling();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [observations, setObservations] = useState('');

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setClientName(user.nome);
      setClientEmail(user.email);
      setClientPhone(user.whatsapp || '');
    }
  }, [user]);

  const baseAvailableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const getSelectedService = () => {
    return services.find(s => s.id === selectedService);
  };

  // Sempre retorna todos os horários disponíveis
  const getAvailableTimes = () => {
    return baseAvailableTimes;
  };

  // Função para obter a cor do botão baseada no status
  const getTimeButtonClass = (time: string) => {
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
      default: // 'livre'
        return 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10';
    }
  };

  // Função para verificar se um horário pode ser selecionado
  const canSelectTime = (time: string) => {
    if (!selectedDate || !selectedService) return false;
    
    const service = getSelectedService();
    if (!service) return false;
    
    return isSlotAvailable(selectedDate, time, service.duracao);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
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

  const handlePaymentConfirm = async (pixKey: string, proofFile?: File): Promise<boolean> => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail || !clientPhone) {
      return false;
    }

    // Convert file to base64 if provided (simplified for this example)
    let proofData = undefined;
    if (proofFile) {
      proofData = proofFile.name; // In a real app, you'd upload to storage
    }

    const success = await createAppointment({
      serviceId: selectedService,
      data: selectedDate,
      horario: selectedTime,
      clientName,
      clientEmail,
      clientPhone,
      observacoes: observations,
      chave_pix: pixKey,
      comprovante_pix: proofData
    });

    if (success) {
      // Reset form
      setCurrentStep(1);
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      if (!user) {
        setClientName('');
        setClientEmail('');
        setClientPhone('');
      }
      setObservations('');
    }

    return success;
  };

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
          Agende Seu Horário
        </h1>
        <p className="text-muted-foreground">
          Sistema integrado com banco de dados
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

      {/* Step 1: Select Service */}
      {currentStep === 1 && (
        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-salon-gold flex items-center gap-2">
              <User size={20} />
              Escolha seu Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedService === service.id
                    ? 'border-salon-gold bg-salon-gold/10'
                    : 'border-salon-gold/20 hover:border-salon-gold/40'
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-lg">{service.nome}</h3>
                  {selectedService === service.id ? (
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
                  <span className="text-xs text-salon-copper capitalize">{service.categoria}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Date */}
      {currentStep === 2 && (
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

      {/* Step 3: Select Time */}
      {currentStep === 3 && (
        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-salon-gold flex items-center gap-2">
              <Clock size={20} />
              Escolha o Horário
              {getSelectedService() && (
                <span className="text-sm text-salon-copper ml-2">
                  ({formatDuration(getSelectedService()!.duracao)})
                </span>
              )}
            </CardTitle>
            <div className="text-sm text-salon-copper mt-2">
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-salon-gold/30 border border-salon-gold/50 rounded"></div>
                  <span>Livre</span>
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
              {getAvailableTimes().map((time) => {
                const canSelect = canSelectTime(time);
                const buttonClass = getTimeButtonClass(time);
                
                return (
                  <Button
                    key={time}
                    variant="outline"
                    className={`h-14 text-lg transition-all ${buttonClass}`}
                    onClick={() => canSelect ? setSelectedTime(time) : null}
                    disabled={!canSelect}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Contact Info */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold flex items-center gap-2">
                <MessageSquare size={20} />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user && (
                <>
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
                    <label className="block text-sm font-medium mb-2 text-white">Email *</label>
                    <Input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="seu@email.com"
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
                </>
              )}
              
              {user && (
                <div className="space-y-4 p-4 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
                  <h4 className="text-white font-medium">Seus dados:</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><span className="text-salon-copper">Nome:</span> <span className="text-white">{user.nome}</span></div>
                    <div><span className="text-salon-copper">Email:</span> <span className="text-white">{user.email}</span></div>
                    {user.whatsapp && <div><span className="text-salon-copper">WhatsApp:</span> <span className="text-white">{user.whatsapp}</span></div>}
                  </div>
                </div>
              )}
              
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
              {getSelectedService() && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviço:</span>
                    <span className="text-white font-medium">{getSelectedService()!.nome}</span>
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
                    <span className="text-white font-medium">{formatDuration(getSelectedService()!.duracao)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-salon-gold/30">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="text-salon-gold font-bold text-xl">
                      R$ {getSelectedService()!.preco.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 5: PIX Payment */}
      {currentStep === 5 && getSelectedService() && (
        <PIXPaymentStep
          amount={getSelectedService()!.preco}
          serviceName={getSelectedService()!.nome}
          onPaymentConfirm={handlePaymentConfirm}
          loading={loading}
        />
      )}

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
        
        {currentStep < 5 && currentStep !== 4 && (
          <Button
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && !selectedService) ||
              (currentStep === 2 && !selectedDate) ||
              (currentStep === 3 && !selectedTime) ||
              loading
            }
            className={`${currentStep === 1 ? 'w-full' : 'flex-1'} bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-14`}
          >
            Continuar
          </Button>
        )}
        
        {currentStep === 4 && (
          <Button
            onClick={handleNextStep}
            disabled={
              (!user && (!clientName || !clientEmail || !clientPhone)) ||
              loading
            }
            className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-14"
          >
            Prosseguir para Pagamento
          </Button>
        )}
      </div>
    </div>
  );
};

export default SupabaseScheduling;
