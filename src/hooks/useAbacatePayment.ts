
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/hooks/useSharedCart';
import { Coupon } from '@/hooks/useCoupons';

export const useAbacatePayment = () => {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeData: string;
    transactionId: string;
    expiresAt: string;
  } | null>(null);
  const { toast } = useToast();

  const createPixPayment = async (
    cartItems: CartItem[],
    paymentMethod: string,
    coupon: Coupon | null,
    discount: number,
    finalTotal: number
  ) => {
    try {
      setLoading(true);
      console.log('Iniciando pagamento PIX:', { cartItems, paymentMethod, coupon, discount, finalTotal });

      // Criar descrição da compra
      const itemNames = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
      const description = `Compra: ${itemNames}${coupon ? ` (Cupom: ${coupon.codigo})` : ''}`;

      // Criar pagamento PIX via AbacatePay
      const { data: pixResponse, error: pixError } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount: finalTotal,
          description: description,
          customerName: 'Cliente',
          customerEmail: 'cliente@exemplo.com',
          customerPhone: '11999999999',
          customerCPF: '000.000.000-00'
        }
      });

      if (pixError) {
        console.error('Erro ao criar pagamento PIX:', pixError);
        throw new Error('Erro ao criar pagamento PIX');
      }

      if (!pixResponse.success) {
        console.error('Erro na resposta do PIX:', pixResponse);
        throw new Error(pixResponse.error || 'Erro ao criar pagamento PIX');
      }

      setPixData({
        qrCode: pixResponse.qrCode,
        qrCodeData: pixResponse.qrCodeData,
        transactionId: pixResponse.transactionId,
        expiresAt: pixResponse.expiresAt
      });

      toast({
        title: "PIX gerado com sucesso! 📱",
        description: "Use o QR Code ou a chave PIX para realizar o pagamento.",
      });

      return pixResponse;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o pagamento PIX. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (transactionId: string) => {
    try {
      const { data: statusResponse, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          action: 'check',
          transactionId: transactionId
        }
      });

      if (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        return { isPaid: false, status: 'ERROR' };
      }

      return {
        isPaid: statusResponse.isPaid || false,
        status: statusResponse.status || 'UNKNOWN'
      };
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return { isPaid: false, status: 'ERROR' };
    }
  };

  const clearPixData = () => {
    setPixData(null);
  };

  return {
    loading,
    pixData,
    createPixPayment,
    checkPaymentStatus,
    clearPixData,
  };
};
