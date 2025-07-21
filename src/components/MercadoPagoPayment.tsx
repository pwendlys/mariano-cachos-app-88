
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MercadoPagoPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentIds: string[];
  serviceNames: string[];
  onPaymentSuccess: () => Promise<boolean>;
}

const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({
  isOpen,
  onClose,
  amount,
  serviceName,
  customerName,
  customerEmail,
  customerPhone,
  appointmentIds,
  serviceNames,
  onPaymentSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      console.log('Creating Mercado Pago payment preference...');

      const { data, error } = await supabase.functions.invoke('mercado-pago-payment', {
        body: {
          action: 'create_payment',
          amount,
          description: `Sinal - ${serviceName}`,
          customerEmail,
          customerName,
          customerPhone,
          metadata: {
            appointmentIds,
            serviceNames
          }
        }
      });

      if (error) {
        console.error('Error creating payment:', error);
        throw error;
      }

      console.log('Payment preference created:', data);

      // Use sandbox URL for testing, init_point for production
      const paymentUrl = data.sandbox_init_point || data.init_point;
      setPaymentUrl(paymentUrl);

      toast({
        title: "Redirecionamento para pagamento",
        description: "Você será redirecionado para o Mercado Pago para concluir o pagamento.",
      });

      // Open payment URL in new window
      window.open(paymentUrl, '_blank');

    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Não foi possível criar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async () => {
    const success = await onPaymentSuccess();
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <CreditCard size={20} />
            Pagamento do Sinal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-white font-medium mb-2">{serviceName}</h3>
            <p className="text-salon-copper">Valor do sinal</p>
            <p className="text-2xl font-bold text-salon-gold">
              R$ {amount.toFixed(2)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-salon-dark/30 rounded-lg">
              <p className="text-white text-sm">
                <span className="text-salon-copper">Cliente:</span> {customerName}
              </p>
              <p className="text-white text-sm">
                <span className="text-salon-copper">Email:</span> {customerEmail}
              </p>
              <p className="text-white text-sm">
                <span className="text-salon-copper">Telefone:</span> {customerPhone}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center p-3 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
                <CreditCard className="text-salon-gold mb-2" size={24} />
                <span className="text-white text-sm text-center">Cartão de Crédito</span>
                <span className="text-salon-copper text-xs">até 12x sem juros</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
                <QrCode className="text-salon-gold mb-2" size={24} />
                <span className="text-white text-sm text-center">PIX</span>
                <span className="text-salon-copper text-xs">aprovação instantânea</span>
              </div>
            </div>

            {!paymentUrl ? (
              <Button
                onClick={handleCreatePayment}
                disabled={loading}
                className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Pagar com Mercado Pago"
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => window.open(paymentUrl, '_blank')}
                  className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Mercado Pago
                </Button>
                <Button
                  onClick={handlePaymentComplete}
                  variant="outline"
                  className="w-full border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  Já paguei - Confirmar Agendamento
                </Button>
              </div>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
            >
              Cancelar
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Pagamento seguro processado pelo Mercado Pago
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MercadoPagoPayment;
