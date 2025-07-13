
import React, { useState } from 'react';
import { QrCode, CreditCard, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PIXPaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onPaymentConfirm: (pixKey: string, qrCodeData?: string, transactionId?: string) => Promise<boolean>;
}

const PIXPaymentPopup: React.FC<PIXPaymentPopupProps> = ({
  isOpen,
  onClose,
  amount,
  serviceName,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentConfirm
}) => {
  const [formData, setFormData] = useState({
    nome: customerName,
    email: customerEmail,
    telefone: customerPhone,
    cpf: ''
  });
  const [pixKey, setPixKey] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const { toast } = useToast();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.telefone.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Por favor, informe seu telefone.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.cpf.trim()) {
      toast({
        title: "CPF obrigatório",
        description: "Por favor, informe seu CPF.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validação básica de CPF (11 dígitos)
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "Por favor, informe um CPF válido com 11 dígitos.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleGenerateQRCode = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      console.log('Sending data to edge function:', {
        amount: amount,
        description: `Sinal para agendamento - ${serviceName}`,
        customerName: formData.nome,
        customerEmail: formData.email,
        customerPhone: formData.telefone.replace(/\D/g, ''),
        customerCPF: formData.cpf.replace(/\D/g, '')
      });

      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount: amount,
          description: `Sinal para agendamento - ${serviceName}`,
          customerName: formData.nome,
          customerEmail: formData.email,
          customerPhone: formData.telefone.replace(/\D/g, ''),
          customerCPF: formData.cpf.replace(/\D/g, '')
        }
      });

      console.log('Response from edge function:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro ao chamar função do Supabase');
      }

      if (data && data.success) {
        setQrCodeData(data.qrCodeData);
        setTransactionId(data.transactionId);
        setPixKey(data.pixKey);
        setQrCodeGenerated(true);
        toast({
          title: "QR Code gerado com sucesso!",
          description: "Use o código PIX para realizar o pagamento.",
        });
      } else {
        throw new Error(data?.error || 'Erro desconhecido ao gerar QR Code');
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: error.message || "Não foi possível gerar o código PIX.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pixKey.trim()) {
      toast({
        title: "QR Code não gerado",
        description: "Por favor, gere o QR Code primeiro.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await onPaymentConfirm(pixKey, qrCodeData, transactionId);
      if (success) {
        onClose();
        // Reset form
        setFormData({
          nome: customerName,
          email: customerEmail,
          telefone: customerPhone,
          cpf: ''
        });
        setPixKey('');
        setQrCodeData('');
        setTransactionId('');
        setQrCodeGenerated(false);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-salon-dark border-salon-gold/20">
        <DialogHeader>
          <DialogTitle className="text-salon-gold flex items-center gap-2">
            <CreditCard size={20} />
            Pagamento PIX - Sinal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Display */}
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="pt-6">
              <div className="text-center p-4 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
                <h3 className="text-lg text-white mb-2">Valor do Sinal</h3>
                <div className="text-3xl font-bold text-salon-gold mb-2">
                  R$ {amount.toFixed(2)}
                </div>
                <p className="text-sm text-salon-copper">{serviceName}</p>
                <p className="text-xs text-salon-copper mt-1">
                  *Valor será descontado do total no dia do atendimento
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Form */}
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold text-sm">Dados para Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-white">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Seu nome completo"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12 mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12 mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="telefone" className="text-white">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12 mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="cpf" className="text-white">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12 mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate QR Code Button */}
          {!qrCodeGenerated && (
            <Button
              onClick={handleGenerateQRCode}
              disabled={loading}
              className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Gerar QR Code PIX
                </>
              )}
            </Button>
          )}

          {/* QR Code Display */}
          {qrCodeGenerated && qrCodeData && (
            <Card className="glass-card border-salon-gold/20">
              <CardHeader>
                <CardTitle className="text-salon-gold flex items-center gap-2">
                  <QrCode size={20} />
                  QR Code PIX
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-4">
                    <img 
                      src={`data:image/png;base64,${qrCodeData}`} 
                      alt="QR Code PIX" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-salon-copper text-center">
                    Escaneie o código com o app do seu banco
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PIX Key Display */}
          {pixKey && (
            <div>
              <Label htmlFor="pix-key" className="text-white">
                Código PIX Copia e Cola
              </Label>
              <Input
                id="pix-key"
                value={pixKey}
                readOnly
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12 mt-2 text-xs"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
          )}

          {/* Instructions */}
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-salon-copper">
                <h4 className="font-semibold text-white">Instruções:</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Preencha todos os dados obrigatórios</li>
                  <li>Clique em "Gerar QR Code PIX" para criar o código</li>
                  <li>Realize o pagamento usando o QR Code ou código copia e cola</li>
                  <li>O valor de R$ {amount.toFixed(2)} será descontado no dia do atendimento</li>
                  <li>Aguarde a confirmação do pagamento</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleConfirmPayment}
              disabled={!qrCodeGenerated || loading}
              className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PIXPaymentPopup;
