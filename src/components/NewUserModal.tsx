
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, User, Mail, Phone, Lock, UserCheck } from 'lucide-react';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'cliente' as 'cliente' | 'convidado'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      confirmarSenha: '',
      tipo: 'cliente'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O email é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.senha) {
      toast({
        title: "Campo obrigatório",
        description: "A senha é obrigatória.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e confirmação devem ser iguais.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.senha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Verificar se o email já existe na tabela usuarios
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar usuário existente:', checkError);
        throw checkError;
      }

      if (existingUser) {
        toast({
          title: "Email já em uso",
          description: "Já existe um usuário cadastrado com este email.",
          variant: "destructive"
        });
        return;
      }

      // Criar usuário na tabela usuarios
      const { data: newUser, error: userError } = await supabase
        .from('usuarios')
        .insert({
          nome: formData.nome.trim(),
          email: formData.email.toLowerCase().trim(),
          whatsapp: formData.telefone.trim() || null,
          senha: formData.senha,
          tipo: formData.tipo,
          ativo: true
        })
        .select()
        .single();

      if (userError) {
        console.error('Erro ao criar usuário:', userError);
        throw userError;
      }

      // Verificar se já existe cliente com o mesmo email
      const { data: existingClient, error: clientCheckError } = await supabase
        .from('clientes')
        .select('id, telefone')
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (clientCheckError && clientCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar cliente existente:', clientCheckError);
      }

      if (existingClient) {
        // Atualizar cliente existente
        const { error: updateError } = await supabase
          .from('clientes')
          .update({
            nome: formData.nome.trim(),
            telefone: formData.telefone.trim() || existingClient.telefone
          })
          .eq('id', existingClient.id);

        if (updateError) {
          console.error('Erro ao atualizar cliente:', updateError);
        }
      } else {
        // Criar novo cliente
        const { error: clientError } = await supabase
          .from('clientes')
          .insert({
            nome: formData.nome.trim(),
            email: formData.email.toLowerCase().trim(),
            telefone: formData.telefone.trim() || ''
          });

        if (clientError) {
          console.error('Erro ao criar cliente:', clientError);
        }
      }

      toast({
        title: "Usuário criado com sucesso!",
        description: `${formData.tipo === 'convidado' ? 'Usuário convidado' : 'Cliente'} ${formData.nome} foi criado e já pode fazer login no sistema.`,
      });

      resetForm();
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro ao criar usuário",
        description: "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-salon-gold flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Novo Cliente/Usuário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-salon-copper flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="glass-card border-salon-gold/30 bg-transparent text-white"
              placeholder="Nome completo"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-salon-copper flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="glass-card border-salon-gold/30 bg-transparent text-white"
              placeholder="email@exemplo.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-salon-copper flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              className="glass-card border-salon-gold/30 bg-transparent text-white"
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-salon-copper">
              Tipo de Usuário *
            </Label>
            <Select 
              value={formData.tipo} 
              onValueChange={(value: 'cliente' | 'convidado') => 
                setFormData(prev => ({ ...prev, tipo: value }))
              }
              disabled={loading}
            >
              <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-salon-gold/30 bg-salon-dark text-white">
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="convidado">Convidado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha" className="text-salon-copper flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Senha *
            </Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              className="glass-card border-salon-gold/30 bg-transparent text-white"
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="text-salon-copper flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar Senha *
            </Label>
            <Input
              id="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
              className="glass-card border-salon-gold/30 bg-transparent text-white"
              placeholder="Digite a senha novamente"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserModal;
