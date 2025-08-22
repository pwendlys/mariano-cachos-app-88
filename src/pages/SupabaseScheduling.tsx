import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MessageSquare, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseScheduling } from '@/hooks/useSupabaseScheduling';
import { useAuth } from '@/hooks/useAuth';
import PIXPaymentPopup from '@/components/PIXPaymentPopup';
import ServiceSelectionCard from '@/components/ServiceSelectionCard';
import TimeSlotGrid from '@/components/TimeSlotGrid';
import AppointmentSummaryCard from '@/components/AppointmentSummaryCard';
import OrnateHeading from '@/components/OrnateHeading';
import ServiceFilters from '@/components/ServiceFilters';
import EncaixeConfirmationModal from '@/components/EncaixeConfirmationModal';

const SupabaseScheduling = () => {
  const { services, createMultipleAppointments, isSlotAvailable, getSlotStatus, loading } = useSupabaseScheduling();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [observations, setObservations] = useState('');
  const [showPixPopup, setShowPixPopup] = useState(false);
  
  // Service filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Encaixe states
  const [showEncaixeModal, setShowEncaixeModal] = useState(false);
  const [encaixeTime, setEncaixeTime] = useState('');

  // Fixed deposit amount of 50 reais
  const DEPOSIT_AMOUNT = 50.00;

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

  // Get unique categories from services
  const categories = Array.from(new Set(services.map(s => s.categoria))).sort();

  // Filter services based on search and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSelectedServicesData = () => {
    return services.filter(s => selectedServices.includes(s.id));
  };

  const getTotalServiceDuration = () => {
    return getSelectedServicesData().reduce((total, service) => total + service.duracao, 0);
  };

  const getTotalServicePrice = () => {
    return getSelectedServicesData().reduce((total, service) => total + service.preco, 0);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const handleEncaixeRequest = (time: string) => {
    setEncaixeTime(time);
    setShowEncaixeModal(true);
  };

  const handleConfirmEncaixe = async () => {
    if (!selectedServices.length || !selectedDate || !encaixeTime || !clientName || !clientEmail || !clientPhone) {
      return;
    }

    const success = await createMultipleAppointments({
      serviceIds: selectedServices,
      data: selectedDate,
      horario: encaixeTime,
      clientName,
      clientEmail,
      clientPhone,
      observacoes: `${observations}\n\n[ENCAIXE SOLICITADO]`,
      chave_pix: undefined,
      chave_pix_abacate: undefined,
      qr_code_data: undefined,
      transaction_id: undefined,
      comprovante_pix: undefined
    });

    if (success) {
      // Reset form
      setCurrentStep(1);
      setSelectedServices([]);
      setSelectedDate('');
      setSelectedTime('');
      setEncaixeTime('');
      if (!user) {
        setClientName('');
        setClientEmail('');
        setClientPhone('');
      }
      setObservations('');
      setShowEncaixeModal(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProceedToPayment = () => {
    setShowPixPopup(true);
  };

  const handlePaymentConfirm = async (pixKey: string, qrCodeData?: string, transactionId?: string): Promise<boolean> => {
    if (!selectedServices.length || !selectedDate || !selectedTime || !clientName || !clientEmail || !clientPhone) {
      return false;
    }

    const success = await createMultipleAppointments({
      serviceIds: selectedServices,
      data: selectedDate,
      horario: selectedTime,
      clientName,
      clientEmail,
      clientPhone,
      observacoes: observations,
      chave_pix: pixKey,
      chave_pix_abacate: pixKey,
      qr_code_data: qrCodeData,
      transaction_id: transactionId,
      comprovante_pix: undefined
    });

    if (success) {
      // Reset form
      setCurrentStep(1);
      setSelectedServices([]);
      setSelectedDate('');
      setSelectedTime('');
      if (!user) {
        setClientName('');
        setClientEmail('');
        setClientPhone('');
      }
      setObservations('');
      setShowPixPopup(false);
    }

    return success;
  };

  if (loading && services.length === 0) {
    return (
      <div className="px-4 space-y-6 animate-fade-in">
        <OrnateHeading 
          title="Agende Seu Horário" 
          subtitle="Carregando serviços..."
          ornamentImageSrc="/lovable-uploads/328ffbf5-f557-438b-aef8-93e1fc7b7dfb.png"
          hideTitle={true}
        />
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <OrnateHeading 
        title="Agende Seu Horário" 
        subtitle="Escolha múltiplos serviços para um cuidado completo"
        ornamentImageSrc="/lovable-uploads/328ffbf5-f557-438b-aef8-93e1fc7b7dfb.png"
        hideTitle={true}
      />

      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
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
                <span className="text-sm bg-salon-gold/20 text-salon-gold px-2 py-1 rounded-full">
                  {selectedServices.length} selecionado{selectedServices.length > 1 ? 's' : ''}
                </span>
              )}
            </CardTitle>
            {selectedServices.length > 0 && (
              <p className="text-salon-copper text-sm">
                Duração total: {Math.floor(getTotalServiceDuration() / 60)}h {getTotalServiceDuration() % 60}min • 
                Valor: R$ {getTotalServicePrice().toFixed(2)}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {services.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>Nenhum serviço disponível no momento.</p>
                <p className="text-sm mt-2">Entre em contato com o administrador.</p>
              </div>
            ) : (
              <>
                <ServiceFilters
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  onSearchChange={setSearchTerm}
                  onCategoryChange={setSelectedCategory}
                  onClearFilters={handleClearFilters}
                  categories={categories}
                  totalResults={filteredServices.length}
                />
                
                {filteredServices.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>Nenhum serviço encontrado para os filtros aplicados.</p>
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="mt-2 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <ServiceSelectionCard
                      key={service.id}
                      service={service}
                      isSelected={selectedServices.includes(service.id)}
                      onToggle={handleServiceToggle}
                      showDetails={true}
                      hideImage={true}
                    />
                  ))
                )}
              </>
            )}
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
              <span className="text-sm text-salon-copper ml-2">
                (Duração: {Math.floor(getTotalServiceDuration() / 60)}h {getTotalServiceDuration() % 60}min)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSlotGrid
              availableTimes={baseAvailableTimes}
              selectedTime={selectedTime}
              selectedDate={selectedDate}
              serviceDuration={getTotalServiceDuration()}
              onTimeSelect={setSelectedTime}
              getSlotStatus={getSlotStatus}
              isSlotAvailable={isSlotAvailable}
              onEncaixeRequest={handleEncaixeRequest}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Contact Info and Summary */}
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
          <AppointmentSummaryCard
            services={services}
            selectedServiceIds={selectedServices}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientName={clientName}
            clientEmail={clientEmail}
            clientPhone={clientPhone}
            observations={observations}
            depositAmount={DEPOSIT_AMOUNT}
          />
        </div>
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
        
        {currentStep < 4 && (
          <Button
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && selectedServices.length === 0) ||
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
            onClick={handleProceedToPayment}
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

      {/* PIX Payment Popup */}
      <PIXPaymentPopup
        isOpen={showPixPopup}
        onClose={() => setShowPixPopup(false)}
        amount={DEPOSIT_AMOUNT}
        serviceName={`${selectedServices.length} serviço${selectedServices.length > 1 ? 's' : ''} selecionado${selectedServices.length > 1 ? 's' : ''}`}
        customerName={clientName}
        customerEmail={clientEmail}
        customerPhone={clientPhone}
        onPaymentConfirm={handlePaymentConfirm}
      />

      {/* Encaixe Confirmation Modal */}
      <EncaixeConfirmationModal
        isOpen={showEncaixeModal}
        onClose={() => setShowEncaixeModal(false)}
        onConfirm={handleConfirmEncaixe}
        selectedTime={encaixeTime}
        selectedDate={selectedDate}
        serviceNames={getSelectedServicesData().map(s => s.nome)}
      />
    </div>
  );
};

export default SupabaseScheduling;
