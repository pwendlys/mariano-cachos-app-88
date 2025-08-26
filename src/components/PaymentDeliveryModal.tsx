
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, MapPin, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/hooks/useSharedCart';
import { Address } from '@/hooks/useSupabaseOrders';

interface PaymentDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  discountAmount: number;
  finalTotal: number;
  appliedCoupon?: { id: string; codigo: string } | null;
  onPixPayment: () => void;
  onOrderCreated: () => void;
}

const PaymentDeliveryModal = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  discountAmount,
  finalTotal,
  appliedCoupon,
  onPixPayment,
  onOrderCreated
}: PaymentDeliveryModalProps) => {
  const [step, setStep] = useState<'payment' | 'delivery'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
  const [deliveryMode, setDeliveryMode] = useState<'retirada' | 'entrega'>('retirada');
  const [address, setAddress] = useState<Address>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar endereço do cliente se existir
  useEffect(() => {
    const fetchClientAddress = async () => {
      if (!user?.email) return;

      try {
        const { data: cliente, error } = await supabase
          .from('clientes')
          .select('endereco')
          .eq('email', user.email)
          .single();

        if (error) {
          console.log('Cliente não encontrado ou sem endereço');
          return;
        }

        if (cliente?.endereco) {
          // Tentar parsear como JSON se for string, ou usar direto se já for objeto
          try {
            const enderecoData = typeof cliente.endereco === 'string' 
              ? JSON.parse(cliente.endereco) 
              : cliente.endereco;
            
            if (enderecoData && typeof enderecoData === 'object') {
              setAddress(prev => ({
                ...prev,
                ...enderecoData
              }));
            }
          } catch (parseError) {
            console.log('Erro ao parsear endereço:', parseError);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar endereço do cliente:', error);
      }
    };

    if (isOpen && deliveryMode === 'entrega') {
      fetchClientAddress();
    }
  }, [isOpen, deliveryMode, user?.email]);

  const handleReset = () => {
    setStep('payment');
    setPaymentMethod('pix');
    setDeliveryMode('retirada');
    setObservations('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleNextStep = () => {
    if (step === 'payment') {
      setStep('delivery');
    }
  };

  const handleFinalize = async () => {
    // Se for PIX + Retirada, usar o fluxo antigo
    if (paymentMethod === 'pix' && deliveryMode === 'retirada') {
      handleClose();
      onPixPayment();
      return;
    }

    // Caso contrário, criar pedido para aprovação do admin
    setLoading(true);

    try {
      const { useSupabaseOrders } = await import('@/hooks/useSupabaseOrders');
      const { createOrder } = useSupabaseOrders();

      const orderData = {
        metodo_pagamento: paymentMethod,
        modalidade_entrega: deliveryMode,
        endereco_entrega: deliveryMode === 'entrega' ? address : undefined,
        observacoes: observations || undefined,
        subtotal: totalAmount,
        desconto: discountAmount,
        total_estimado: finalTotal,
        cupom_id: appliedCoupon?.id,
        itens: cartItems,
        status: 'aguardando_confirmacao' as const
      };

      const order = await createOrder(orderData);

      if (order) {
        toast({
          title: "Pedido enviado! 📋",
          description: "Seu pedido foi enviado para confirmação. Você receberá uma notificação quando for aprovado.",
        });
        
        handleClose();
        onOrderCreated();
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Não foi possível enviar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAddressValid = deliveryMode === 'retirada' || (
    address.cep && address.rua && address.numero && address.bairro && address.cidade && address.uf
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-salon-gold/20 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-salon-gold flex items-center gap-2">
            {step === 'payment' ? (
              <>
                <CreditCard size={20} />
                Forma de Pagamento
              </>
            ) : (
              <>
                <MapPin size={20} />
                Entrega
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'payment' && (
            <>
              <div className="space-y-3">
                <Label className="text-salon-gold">Escolha a forma de pagamento:</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-2">
                    <Card className="glass-card border-salon-gold/20">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer text-white">
                            <Smartphone size={16} className="text-salon-gold" />
                            PIX (Instantâneo)
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-salon-gold/20">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cartao" id="cartao" />
                          <Label htmlFor="cartao" className="flex items-center gap-2 cursor-pointer text-white">
                            <CreditCard size={16} className="text-salon-gold" />
                            Cartão
                          </Label>
                        </div>
                        {paymentMethod === 'cartao' && (
                          <p className="text-xs text-yellow-400 mt-2 ml-6">
                            ⚠️ Pode haver juros que serão informados na confirmação
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-salon-gold/20">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dinheiro" id="dinheiro" />
                          <Label htmlFor="dinheiro" className="flex items-center gap-2 cursor-pointer text-white">
                            <Banknote size={16} className="text-salon-gold" />
                            Dinheiro
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-bold h-12"
              >
                Continuar
              </Button>
            </>
          )}

          {step === 'delivery' && (
            <>
              <div className="space-y-3">
                <Label className="text-salon-gold">Escolha o modo de entrega:</Label>
                <RadioGroup value={deliveryMode} onValueChange={(value: any) => setDeliveryMode(value)}>
                  <div className="space-y-2">
                    <Card className="glass-card border-salon-gold/20">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="retirada" id="retirada" />
                          <Label htmlFor="retirada" className="flex items-center gap-2 cursor-pointer text-white">
                            <Home size={16} className="text-salon-gold" />
                            Retirada no local
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-salon-gold/20">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="entrega" id="entrega" />
                          <Label htmlFor="entrega" className="flex items-center gap-2 cursor-pointer text-white">
                            <MapPin size={16} className="text-salon-gold" />
                            Entrega
                          </Label>
                        </div>
                        {deliveryMode === 'entrega' && (
                          <p className="text-xs text-yellow-400 mt-2 ml-6">
                            ℹ️ O valor do frete será calculado baseado no endereço
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              {deliveryMode === 'entrega' && (
                <div className="space-y-3">
                  <Label className="text-salon-gold">Endereço de entrega:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="cep" className="text-xs text-muted-foreground">CEP</Label>
                      <Input
                        id="cep"
                        value={address.cep}
                        onChange={(e) => setAddress(prev => ({ ...prev, cep: e.target.value }))}
                        className="glass-card border-salon-gold/30 bg-transparent text-white"
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="uf" className="text-xs text-muted-foreground">UF</Label>
                      <Input
                        id="uf"
                        value={address.uf}
                        onChange={(e) => setAddress(prev => ({ ...prev, uf: e.target.value }))}
                        className="glass-card border-salon-gold/30 bg-transparent text-white"
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cidade" className="text-xs text-muted-foreground">Cidade</Label>
                    <Input
                      id="cidade"
                      value={address.cidade}
                      onChange={(e) => setAddress(prev => ({ ...prev, cidade: e.target.value }))}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                      placeholder="Cidade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairro" className="text-xs text-muted-foreground">Bairro</Label>
                    <Input
                      id="bairro"
                      value={address.bairro}
                      onChange={(e) => setAddress(prev => ({ ...prev, bairro: e.target.value }))}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                      placeholder="Bairro"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="rua" className="text-xs text-muted-foreground">Rua</Label>
                      <Input
                        id="rua"
                        value={address.rua}
                        onChange={(e) => setAddress(prev => ({ ...prev, rua: e.target.value }))}
                        className="glass-card border-salon-gold/30 bg-transparent text-white"
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero" className="text-xs text-muted-foreground">Número</Label>
                      <Input
                        id="numero"
                        value={address.numero}
                        onChange={(e) => setAddress(prev => ({ ...prev, numero: e.target.value }))}
                        className="glass-card border-salon-gold/30 bg-transparent text-white"
                        placeholder="123"
                      />
                    </div>
                  </div>  
                  <div>
                    <Label htmlFor="complemento" className="text-xs text-muted-foreground">Complemento (opcional)</Label>
                    <Input
                      id="complemento"
                      value={address.complemento}
                      onChange={(e) => setAddress(prev => ({ ...prev, complemento: e.target.value }))}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                      placeholder="Apto, bloco, etc."
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observations" className="text-salon-gold">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="glass-card border-salon-gold/30 bg-transparent text-white resize-none"
                  placeholder="Instruções especiais, preferências de horário, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setStep('payment')}
                  variant="outline"
                  className="w-full border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  Voltar
                </Button>

                <Button
                  onClick={handleFinalize}
                  disabled={loading || !isAddressValid}
                  className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-bold h-12"
                >
                  {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-salon-dark border-t-transparent rounded-full mr-2" />
                  ) : null}
                  {paymentMethod === 'pix' && deliveryMode === 'retirada' 
                    ? `Pagar com PIX - R$ ${finalTotal.toFixed(2)}`
                    : 'Enviar Pedido para Confirmação'
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDeliveryModal;
