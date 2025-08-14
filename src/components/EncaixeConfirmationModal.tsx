
import React from 'react';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EncaixeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedTime: string;
  selectedDate: string;
  serviceNames: string[];
}

const EncaixeConfirmationModal: React.FC<EncaixeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedTime,
  selectedDate,
  serviceNames
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-salon-gold/30 bg-salon-dark max-w-md">
        <DialogHeader>
          <DialogTitle className="text-salon-gold flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-400" />
            Solicitar Encaixe
          </DialogTitle>
          <DialogDescription className="text-salon-copper">
            Você está solicitando um encaixe em um horário já ocupado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalhes do agendamento */}
          <div className="p-4 bg-salon-gold/10 rounded-lg border border-salon-gold/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white">
                <Calendar size={16} className="text-salon-copper" />
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} className="text-salon-copper" />
                <span className="font-medium">{selectedTime}</span>
              </div>

              <div className="mt-3">
                <span className="text-salon-copper text-sm">Serviços:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {serviceNames.map((serviceName, index) => (
                    <Badge key={index} variant="outline" className="text-salon-gold border-salon-gold/30">
                      {serviceName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Informações sobre encaixe */}
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-orange-300 font-medium mb-1">O que é um encaixe?</p>
                <p className="text-orange-200">
                  Seu pedido será enviado ao salão. Se houver disponibilidade, você será notificado sobre a confirmação.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={onConfirm}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Solicitar Encaixe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EncaixeConfirmationModal;
