
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { resetPassword } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('E-mail é obrigatório');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('E-mail inválido');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Erro ao enviar email');
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-transparent border-salon-gold/70 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-gradient-gold text-center">
            {success ? 'Email Enviado!' : 'Recuperar Senha'}
          </DialogTitle>
          <DialogDescription className="text-white text-center" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
            {success 
              ? 'Verifique sua caixa de entrada para o link de recuperação'
              : 'Digite seu email para receber um link de recuperação de senha'
            }
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-white text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                Um email com instruções foi enviado para <strong>{email}</strong>
              </p>
            </div>
            <Button 
              onClick={handleClose}
              className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-semibold"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-white font-semibold">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-semibold"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Link'}
              </Button>
              
              <Button 
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="w-full text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
