
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseServices, SupabaseService } from '@/hooks/useSupabaseServices';
import ServiceSelectionCard from '@/components/ServiceSelectionCard';

interface Service extends SupabaseService {}

const SupabaseScheduling = () => {
  const { toast } = useToast();
  const { services } = useSupabaseServices();

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 0),
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const formattedDate = date?.from && date?.to ?
    `${format(date.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(date.to, 'dd/MM/yyyy', { locale: ptBR })}` :
    'Selecione um período';

  const toggleService = (serviceId: string) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date?.from || !date?.to) {
      toast({
        title: 'Datas inválidas',
        description: 'Por favor, selecione um período válido.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: 'Serviços não selecionados',
        description: 'Por favor, selecione ao menos um serviço.',
        variant: 'destructive',
      });
      return;
    }

    if (!name || !contact) {
      toast({
        title: 'Dados do cliente incompletos',
        description: 'Por favor, preencha o nome e contato do cliente.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([
          {
            data_inicio: date.from.toISOString(),
            data_fim: date.to.toISOString(),
            servicos: selectedServices,
            nome_cliente: name,
            contato_cliente: contact,
            observacoes: notes,
          },
        ]);

      if (error) {
        console.error('Erro ao salvar agendamento:', error);
        throw new Error(error.message);
      }

      console.log('Agendamento salvo com sucesso:', data);
      toast({
        title: 'Agendamento realizado!',
        description: 'Seu agendamento foi salvo com sucesso.',
      });

      // Limpar os campos após o sucesso
      setDate({
        from: new Date(),
        to: addDays(new Date(), 0),
      });
      setSelectedServices([]);
      setName('');
      setContact('');
      setNotes('');
    } catch (error: any) {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: 'Erro ao agendar',
        description: error.message || 'Ocorreu um erro ao salvar o agendamento.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter((service) =>
    service.nome.toLowerCase().includes(searchTerm.toLowerCase()) && service.ativo
  );

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-salon-gold">Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Range Picker */}
            <div>
              <Label className="text-sm font-medium block mb-2 text-white">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className="w-full justify-start text-left font-normal glass-card border-salon-gold/30 text-white hover:bg-salon-gold/10 h-12"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formattedDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card border-salon-gold/30">
                  <CalendarUI
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={ptBR}
                    disabled={(date) =>
                      date < new Date()
                    }
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Services Selection */}
            <div>
              <Label className="text-sm font-medium block mb-2 text-white">Serviços</Label>
              <Input
                type="search"
                placeholder="Buscar serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
              <ScrollArea className="rounded-md border border-salon-gold/30 h-[300px] mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-3">
                  {filteredServices.map((service) => (
                    <ServiceSelectionCard
                      key={service.id}
                      service={service}
                      isSelected={selectedServices.includes(service.id)}
                      onToggle={toggleService}
                      showDetails={true}
                    />
                  ))}
                </div>
              </ScrollArea>
              {filteredServices.length === 0 && (
                <div className="mt-2 text-center text-salon-copper">
                  Nenhum serviço encontrado.
                </div>
              )}
            </div>

            {/* Client Information */}
            <div>
              <Label className="text-sm font-medium block mb-2 text-white">Nome do Cliente</Label>
              <Input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
            </div>
            <div>
              <Label className="text-sm font-medium block mb-2 text-white">Contato</Label>
              <Input
                type="tel"
                placeholder="(00) 00000-0000"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium block mb-2 text-white">Observações</Label>
              <Textarea
                placeholder="Alguma observação adicional?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="glass-card border-salon-gold/30 bg-transparent text-white"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Agendando...' : 'Agendar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseScheduling;
