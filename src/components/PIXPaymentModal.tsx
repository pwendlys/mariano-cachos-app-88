
import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PIXPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    qrCode: string;
    qrCodeData: string;
    transactionId: string;
    expiresAt: string;
  } | null;
  onPaymentConfirmed: () => void;
  checkPaymentStatus: (transactionId: string) => Promise<{ isPaid: boolean; status: string }>;
}

const PIXPaymentModal = ({ 
  isOpen, 
  onClose, 
  pixData, 
  onPaymentConfirmed,
  checkPaymentStatus 
}: PIXPaymentModalProps) => {
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (!pixData?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(pixData.expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expirado');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [pixData?.expiresAt]);

  useEffect(() => {
    if (!isOpen || !pixData?.transactionId) return;

    const checkStatus = async () => {
      try {
        const result = await checkPaymentStatus(pixData.transactionId);
        if (result.isPaid) {
          onPaymentConfirmed();
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [isOpen, pixData?.transactionId, checkPaymentStatus, onPaymentConfirmed]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência.",
    });
  };

  const handleCheckPayment = async () => {
    if (!pixData?.transactionId) return;

    try {
      setChecking(true);
      const result = await checkPaymentStatus(pixData.transactionId);
      
      if (result.isPaid) {
        toast({
          title: "Pagamento confirmado! 🎉",
          description: "Seu pagamento foi processado com sucesso.",
        });
        onPaymentConfirmed();
      } else {
        toast({
          title: "Pagamento pendente",
          description: "O pagamento ainda não foi confirmado. Aguarde alguns instantes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  if (!pixData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-salon-gold/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-salon-gold flex items-center gap-2">
            <Clock size={20} />
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg mb-4 inline-block">
              <img 
                src={`data:image/png;base64,${pixData.qrCodeData}`}
                alt="QR Code PIX" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Escaneie o QR Code ou copie a chave PIX
            </p>
            <div className="bg-salon-gold/10 border border-salon-gold/30 rounded-lg p-2 mb-4">
              <p className="text-salon-gold font-bold">
                Tempo restante: {timeLeft}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => copyToClipboard(pixData.qrCode)}
              variant="outline"
              className="w-full border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
            >
              <Copy className="mr-2" size={16} />
              Copiar Chave PIX
            </Button>

            <Button
              onClick={handleCheckPayment}
              disabled={checking}
              className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark"
            >
              {checking ? (
                <div className="animate-spin w-4 h-4 border-2 border-salon-dark border-t-transparent rounded-full mr-2" />
              ) : (
                <CheckCircle className="mr-2" size={16} />
              )}
              {checking ? 'Verificando...' : 'Verificar Pagamento'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            O pagamento será verificado automaticamente quando confirmado.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PIXPaymentModal;
