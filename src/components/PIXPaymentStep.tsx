import React, { useState } from 'react';
import { QrCode, CreditCard, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PIXPaymentStepProps {
  amount: number;
  serviceName: string;
  onPaymentConfirm: (pixKey: string, proofFile?: File) => Promise<boolean>;
  loading: boolean;
}

const PIXPaymentStep: React.FC<PIXPaymentStepProps> = ({
  amount,
  serviceName,
  onPaymentConfirm,
  loading
}) => {
  const [pixKey, setPixKey] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofUploaded(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pixKey.trim()) return;
    
    const success = await onPaymentConfirm(pixKey, proofFile || undefined);
    if (success) {
      // Reset form
      setPixKey('');
      setProofFile(null);
      setProofUploaded(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Amount Card */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <CreditCard size={20} />
            Pagamento PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
            <h3 className="text-lg text-white mb-2">Valor a pagar</h3>
            <div className="text-3xl font-bold text-salon-gold mb-2">
              R$ {amount.toFixed(2)}
            </div>
            <p className="text-sm text-salon-copper">{serviceName}</p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Area */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <QrCode size={20} />
            QR Code PIX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <QrCode size={64} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  QR Code será gerado aqui
                </p>
              </div>
            </div>
            <p className="text-sm text-salon-copper text-center">
              Use o aplicativo do seu banco para escanear o código QR e realizar o pagamento
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PIX Key Input */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold">Chave PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pix-key" className="text-white">
              Informe a chave PIX utilizada para o pagamento *
            </Label>
            <Input
              id="pix-key"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              className="glass-card border-salon-gold/30 bg-transparent text-white h-12 mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="proof-upload" className="text-white">
              Comprovante de Pagamento (opcional)
            </Label>
            <div className="mt-2">
              <input
                id="proof-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('proof-upload')?.click()}
                className="w-full border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
              >
                <Upload size={16} className="mr-2" />
                {proofUploaded ? (
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    Comprovante enviado
                  </span>
                ) : (
                  'Enviar Comprovante'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="glass-card border-salon-gold/20">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm text-salon-copper">
            <h4 className="font-semibold text-white">Instruções:</h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>Realize o pagamento usando o QR Code acima</li>
              <li>Informe a chave PIX que você utilizou</li>
              <li>Envie o comprovante (opcional, mas recomendado)</li>
              <li>Aguarde a aprovação do seu agendamento</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Payment Button */}
      <Button
        onClick={handleConfirmPayment}
        disabled={!pixKey.trim() || loading}
        className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-14"
      >
        {loading ? 'Processando...' : 'Confirmar Pagamento'}
      </Button>
    </div>
  );
};

export default PIXPaymentStep;