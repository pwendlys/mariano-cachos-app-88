import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, AlertTriangle, CheckCircle, Calendar, Users, Phone, Mail, UserCheck, FileText, X, Filter, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebtCollection, Devedor, Divida } from '@/hooks/useDebtCollection';
import { useCustomerProfiles } from '@/hooks/useCustomerProfiles';
import CustomerProfileManagement from '@/components/CustomerProfileManagement';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DebtCollectionManagement = () => {
  const { 
    devedores, 
    dividas, 
    cobrancas,
    saldosClientes,
    loading, 
    createDevedor, 
    createDivida, 
    updateDividaStatus,
    createCobranca,
    updateCollectionDate,
    sendWhatsAppCollection,
    getTotals 
  } = useDebtCollection();

  const { syncCustomerData } = useCustomerProfiles();
  const { toast } = useToast();

  const [isDevedorDialogOpen, setIsDevedorDialogOpen] = useState(false);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);
  const [isCobrancaDialogOpen, setIsCobrancaDialogOpen] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<Divida | null>(null);
  const [showReport, setShowReport] = useState<'aberto' | 'recebido' | null>(null);
  const [collectionDateFilter, setCollectionDateFilter] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [devedorForm, setDevedorForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    documento: '',
    observacoes: '',
    senha: '',
    confirmarSenha: ''
  });

  const [dividaForm, setDividaForm] = useState({
    devedor_id: '',
    descricao: '',
    valor_original: '',
    valor_atual: '',
    data_vencimento: '',
    observacoes: ''
  });

  const [cobrancaForm, setCobrancaForm] = useState({
    tipo: 'whatsapp' as const,
    mensagem: ''
  });

  // Helper function to format date for display (fixes timezone issues)
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Force local timezone
    return format(date, 'dd/MM/yyyy');
  };

  // Helper function to format date for input (fixes timezone issues)
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    // Date is already in YYYY-MM-DD format from database
    return dateString;
  };

  // Helper function to handle date change (prevents timezone issues)
  const handleCollectionDateChange = (saldoId: string, dateValue: string) => {
    if (dateValue) {
      // Keep the date in YYYY-MM-DD format without timezone conversion
      updateCollectionDate(saldoId, dateValue);
    } else {
      updateCollectionDate(saldoId, null);
    }
  };

  // Filter and sort clients for collection schedule
  const getFilteredAndSortedClientsForCollection = () => {
    let clientsWithDebt = saldosClientes.filter(s => s.saldo_devedor > 0);

    // Apply date filter if set
    if (collectionDateFilter) {
      clientsWithDebt = clientsWithDebt.filter(s => s.data_cobranca === collectionDateFilter);
    }

    // Sort by collection date (closest first, null dates last)
    return clientsWithDebt.sort((a, b) => {
      // If both have no collection date, maintain original order
      if (!a.data_cobranca && !b.data_cobranca) return 0;
      
      // Items with no collection date go to the end
      if (!a.data_cobranca) return 1;
      if (!b.data_cobranca) return -1;
      
      // Sort by collection date (earliest first)
      return new Date(a.data_cobranca).getTime() - new Date(b.data_cobranca).getTime();
    });
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = [];

    if (!devedorForm.nome.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!devedorForm.telefone.trim()) {
      errors.push('Telefone é obrigatório');
    }

    if (!devedorForm.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!validateEmail(devedorForm.email)) {
      errors.push('Email deve ter um formato válido');
    }

    if (!devedorForm.senha) {
      errors.push('Senha é obrigatória');
    } else if (devedorForm.senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (devedorForm.senha !== devedorForm.confirmarSenha) {
      errors.push('Senhas não coincidem');
    }

    return errors;
  };

  const handleCreateDevedor = async () => {
    try {
      console.log('Iniciando criação de cliente e usuário...');
      
      // Validar formulário
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        toast({
          title: "Erro na validação",
          description: validationErrors.join(', '),
          variant: "destructive"
        });
        return;
      }

      // Verificar se email já existe na tabela usuarios
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', devedorForm.email.toLowerCase())
        .single();

      if (existingUser) {
        toast({
          title: "Erro",
          description: "Já existe um usuário cadastrado com este email.",
          variant: "destructive"
        });
        return;
      }

      console.log('Email não existe, prosseguindo com criação...');

      // 1. Criar usuário na tabela usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          nome: devedorForm.nome,
          email: devedorForm.email.toLowerCase(),
          whatsapp: devedorForm.telefone.replace(/\D/g, ''),
          senha: devedorForm.senha, // Em produção, usar hash
          tipo: 'cliente',
          ativo: true
        })
        .select()
        .single();

      if (usuarioError) {
        console.error('Erro ao criar usuário:', usuarioError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o usuário: " + usuarioError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Usuário criado com sucesso:', usuarioData);

      // 2. Criar cliente na tabela clientes
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          nome: devedorForm.nome,
          telefone: devedorForm.telefone.replace(/\D/g, ''),
          email: devedorForm.email.toLowerCase(),
          endereco: devedorForm.endereco
        })
        .select()
        .single();

      if (clienteError) {
        console.error('Erro ao criar cliente:', clienteError);
        
        // Rollback: remover usuário criado
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', usuarioData.id);

        toast({
          title: "Erro",
          description: "Não foi possível criar o cliente: " + clienteError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Cliente criado com sucesso:', clienteData);

      // 3. Criar devedor na tabela devedores
      const { error: devedorError } = await supabase
        .from('devedores')
        .insert({
          nome: devedorForm.nome,
          telefone: devedorForm.telefone.replace(/\D/g, ''),
          email: devedorForm.email.toLowerCase(),
          endereco: devedorForm.endereco,
          documento: devedorForm.documento,
          observacoes: devedorForm.observacoes,
          ativo: true
        });

      if (devedorError) {
        console.error('Erro ao criar devedor:', devedorError);
        
        // Rollback: remover usuário e cliente criados
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', usuarioData.id);
          
        await supabase
          .from('clientes')
          .delete()
          .eq('id', clienteData.id);

        toast({
          title: "Erro",
          description: "Não foi possível criar o devedor: " + devedorError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Devedor criado com sucesso');

      // Sucesso! Limpar formulário e fechar modal
      setDevedorForm({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        documento: '',
        observacoes: '',
        senha: '',
        confirmarSenha: ''
      });

      setIsDevedorDialogOpen(false);

      toast({
        title: "Sucesso!",
        description: `Cliente e usuário criados com sucesso! ${devedorForm.nome} agora pode fazer login no sistema.`,
      });

      // Recarregar dados
      await syncCustomerData();

    } catch (error) {
      console.error('Erro geral ao criar cliente/usuário:', error);
      toast({
        title: "Erro",
        description: "Erro interno do sistema. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCreateDivida = async () => {
    try {
      await createDivida({
        ...dividaForm,
        valor_original: parseFloat(dividaForm.valor_original),
        valor_atual: parseFloat(dividaForm.valor_atual),
        status: 'em_aberto' as const
      });
      setDividaForm({
        devedor_id: '',
        descricao: '',
        valor_original: '',
        valor_atual: '',
        data_vencimento: '',
        observacoes: ''
      });
      setIsDividaDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar dívida:', error);
    }
  };

  const handleCreateCobranca = async () => {
    if (!selectedDivida) return;
    
    try {
      await createCobranca({
        divida_id: selectedDivida.id,
        tipo: cobrancaForm.tipo,
        mensagem: cobrancaForm.mensagem,
        status: 'pendente',
        tentativa: 1
      });
      setCobrancaForm({
        tipo: 'whatsapp',
        mensagem: ''
      });
      setIsCobrancaDialogOpen(false);
      setSelectedDivida(null);
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_aberto': return 'bg-red-500/20 text-red-400';
      case 'pago': return 'bg-green-500/20 text-green-400';
      case 'parcelado': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelado': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const isOverdue = (dataVencimento: string) => {
    return new Date(dataVencimento) < new Date();
  };

  // Sincronizar dados automaticamente ao carregar o componente
  useEffect(() => {
    syncCustomerData();
  }, []);

  // Renderizar relatório de clientes em aberto - usando saldosClientes para dados mais precisos
  const renderRelatorioAberto = () => {
    const clientesEmAberto = saldosClientes.filter(cliente => cliente.saldo_devedor > 0);
    
    return (
      <Dialog open={showReport === 'aberto'} onOpenChange={() => setShowReport(null)}>
        <DialogContent className="glass-card border-salon-gold/30 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-salon-gold flex items-center gap-2">
              <FileText size={20} />
              Relatório - Clientes com Valores em Aberto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {clientesEmAberto.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum cliente com valor em aberto
              </p>
            ) : (
              clientesEmAberto.map((saldo) => (
                <div key={saldo.id} className="flex items-center justify-between p-4 glass-card rounded-lg border border-red-500/20">
                  <div className="flex-1">
                    <p className="text-white font-medium">{saldo.cliente?.nome}</p>
                    <p className="text-sm text-salon-copper">{saldo.cliente?.telefone}</p>
                    <p className="text-xs text-muted-foreground">{saldo.cliente?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-lg">R$ {saldo.saldo_devedor.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Total Serviços: R$ {saldo.total_servicos.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Produtos: R$ {saldo.total_produtos.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-400">
                      Pago: R$ {saldo.total_pago.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-salon-gold/30">
            <div className="text-salon-gold font-bold">
              Total em Aberto: R$ {clientesEmAberto.reduce((sum, cliente) => sum + cliente.saldo_devedor, 0).toFixed(2)}
            </div>
            <Button
              onClick={() => setShowReport(null)}
              variant="outline"
              className="border-salon-gold/30 text-salon-gold"
            >
              <X size={16} className="mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Renderizar relatório de clientes com valores recebidos - usando saldosClientes
  const renderRelatorioRecebido = () => {
    const clientesComPagamentos = saldosClientes.filter(cliente => cliente.total_pago > 0);
    
    return (
      <Dialog open={showReport === 'recebido'} onOpenChange={() => setShowReport(null)}>
        <DialogContent className="glass-card border-salon-gold/30 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-salon-gold flex items-center gap-2">
              <FileText size={20} />
              Relatório - Clientes com Valores Recebidos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {clientesComPagamentos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum cliente com valores recebidos
              </p>
            ) : (
              clientesComPagamentos.map((saldo) => (
                <div key={saldo.id} className="flex items-center justify-between p-4 glass-card rounded-lg border border-green-500/20">
                  <div className="flex-1">
                    <p className="text-white font-medium">{saldo.cliente?.nome}</p>
                    <p className="text-sm text-salon-copper">{saldo.cliente?.telefone}</p>
                    <p className="text-xs text-muted-foreground">{saldo.cliente?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-lg">R$ {saldo.total_pago.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Total Serviços: R$ {saldo.total_servicos.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Produtos: R$ {saldo.total_produtos.toFixed(2)}
                    </p>
                    {saldo.saldo_devedor > 0 && (
                      <p className="text-xs text-red-400">
                        Pendente: R$ {saldo.saldo_devedor.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-salon-gold/30">
            <div className="text-salon-gold font-bold">
              Total Recebido: R$ {clientesComPagamentos.reduce((sum, cliente) => sum + cliente.total_pago, 0).toFixed(2)}
            </div>
            <Button
              onClick={() => setShowReport(null)}
              variant="outline"
              className="border-salon-gold/30 text-salon-gold"
            >
              <X size={16} className="mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Gestão de Cobranças</h2>
        <div className="flex gap-2">
          <Dialog open={isDevedorDialogOpen} onOpenChange={setIsDevedorDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark">
                <Users className="mr-2" size={16} />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-salon-gold">Novo Cliente + Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={devedorForm.nome}
                    onChange={(e) => setDevedorForm({...devedorForm, nome: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                    placeholder="Nome completo"
                  />
                </div>
                
                <div>
                  <Label>Telefone *</Label>
                  <Input
                    value={devedorForm.telefone}
                    onChange={(e) => setDevedorForm({...devedorForm, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={devedorForm.email}
                    onChange={(e) => setDevedorForm({...devedorForm, email: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label>Senha *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={devedorForm.senha}
                      onChange={(e) => setDevedorForm({...devedorForm, senha: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-salon-gold hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={devedorForm.confirmarSenha}
                      onChange={(e) => setDevedorForm({...devedorForm, confirmarSenha: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white pr-10"
                      placeholder="Digite a senha novamente"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-salon-gold hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input
                    value={devedorForm.documento}
                    onChange={(e) => setDevedorForm({...devedorForm, documento: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label>Endereço</Label>
                  <Textarea
                    value={devedorForm.endereco}
                    onChange={(e) => setDevedorForm({...devedorForm, endereco: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                    placeholder="Endereço completo"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={devedorForm.observacoes}
                    onChange={(e) => setDevedorForm({...devedorForm, observacoes: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                    placeholder="Observações adicionais"
                    rows={2}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={handleCreateDevedor} 
                    className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark"
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : 'Criar Cliente + Usuário'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDevedorDialogOpen(false)} 
                    className="border-salon-gold/30 text-salon-gold"
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  * Campos obrigatórios. O cliente poderá fazer login no sistema com o email e senha criados.
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDividaDialogOpen} onOpenChange={setIsDividaDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="mr-2" size={16} />
                Nova Dívida
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-salon-gold/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-salon-gold">Nova Dívida</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Devedor *</Label>
                  <Select value={dividaForm.devedor_id} onValueChange={(value) => setDividaForm({...dividaForm, devedor_id: value})}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                      <SelectValue placeholder="Selecione o devedor" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      {devedores.map(devedor => (
                        <SelectItem key={devedor.id} value={devedor.id}>
                          {devedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição *</Label>
                  <Input
                    value={dividaForm.descricao}
                    onChange={(e) => setDividaForm({...dividaForm, descricao: e.target.value})}
                    placeholder="Ex: Serviços prestados"
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Original *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={dividaForm.valor_original}
                      onChange={(e) => setDividaForm({...dividaForm, valor_original: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  </div>
                  <div>
                    <Label>Valor Atual *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={dividaForm.valor_atual}
                      onChange={(e) => setDividaForm({...dividaForm, valor_atual: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label>Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={dividaForm.data_vencimento}
                    onChange={(e) => setDividaForm({...dividaForm, data_vencimento: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={dividaForm.observacoes}
                    onChange={(e) => setDividaForm({...dividaForm, observacoes: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleCreateDivida} className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark">
                    Registrar Dívida
                  </Button>
                  <Button variant="outline" onClick={() => setIsDividaDialogOpen(false)} className="border-salon-gold/30 text-salon-gold">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Updated Cards de Resumo with the corrected totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="glass-card border-red-500/20 cursor-pointer hover:border-red-500/40 transition-colors"
          onClick={() => setShowReport('aberto')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 flex items-center gap-2 text-sm">
              <AlertTriangle size={16} />
              Em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {getTotals.totalEmAberto.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver relatório</p>
          </CardContent>
        </Card>

        <Card 
          className="glass-card border-green-500/20 cursor-pointer hover:border-green-500/40 transition-colors"
          onClick={() => setShowReport('recebido')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2 text-sm">
              <CheckCircle size={16} />
              Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {getTotals.totalRecebido.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver relatório</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center gap-2 text-sm">
              <Calendar size={16} />
              Agenda de Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {saldosClientes.filter(s => s.saldo_devedor > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clientes agendados</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-salon-gold flex items-center gap-2 text-sm">
              <DollarSign size={16} />
              Total Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {getTotals.totalGeral.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs with updated Agenda de Cobrança */}
      <Tabs defaultValue="perfis" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="perfis">Perfis de Clientes</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas</TabsTrigger>
          <TabsTrigger value="devedores">Devedores</TabsTrigger>
          <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
          <TabsTrigger value="agenda">Agenda de Cobrança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfis">
          <CustomerProfileManagement />
        </TabsContent>

        <TabsContent value="dividas">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold">Dívidas Registradas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dividas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma dívida registrada
                </p>
              ) : (
                dividas.map((divida) => (
                  <div key={divida.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-white font-medium">{divida.devedor?.nome}</p>
                        <Badge className={getStatusColor(divida.status)}>
                          {divida.status.replace('_', ' ')}
                        </Badge>
                        {isOverdue(divida.data_vencimento) && divida.status === 'em_aberto' && (
                          <Badge className="bg-red-600/20 text-red-400">
                            Vencida
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{divida.descricao}</p>
                      <p className="text-xs text-salon-copper">
                        Venc: {format(new Date(divida.data_vencimento), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold">R$ {divida.valor_atual.toFixed(2)}</p>
                        {divida.valor_atual !== divida.valor_original && (
                          <p className="text-xs text-muted-foreground">
                            Orig: R$ {divida.valor_original.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDivida(divida);
                            setIsCobrancaDialogOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Phone size={14} className="mr-1" />
                          Cobrar
                        </Button>
                        <Select 
                          value={divida.status} 
                          onValueChange={(value) => updateDividaStatus(divida.id, value as Divida['status'])}
                        >
                          <SelectTrigger className="w-32 glass-card border-salon-gold/30 bg-transparent text-white h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-salon-gold/30">
                            <SelectItem value="em_aberto">Em Aberto</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="parcelado">Parcelado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devedores">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold">Devedores Cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {devedores.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum devedor cadastrado
                </p>
              ) : (
                devedores.map((devedor) => (
                  <div key={devedor.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div>
                      <p className="text-white font-medium">{devedor.nome}</p>
                      <p className="text-sm text-muted-foreground">{devedor.telefone}</p>
                      {devedor.email && (
                        <p className="text-xs text-salon-copper">{devedor.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {dividas.filter(d => d.devedor_id === devedor.id && d.status === 'em_aberto').length} dívida(s)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        R$ {dividas
                          .filter(d => d.devedor_id === devedor.id && d.status === 'em_aberto')
                          .reduce((sum, d) => sum + d.valor_atual, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cobrancas">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold">Histórico de Cobranças</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cobrancas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma cobrança registrada
                </p>
              ) : (
                cobrancas.map((cobranca) => (
                  <div key={cobranca.id} className="p-4 glass-card rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {cobranca.tipo === 'whatsapp' && <Phone size={16} className="text-green-400" />}
                        {cobranca.tipo === 'email' && <Mail size={16} className="text-blue-400" />}
                        <Badge className={getStatusColor(cobranca.status)}>
                          {cobranca.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(cobranca.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    {cobranca.mensagem && (
                      <p className="text-sm text-white">{cobranca.mensagem}</p>
                    )}
                    {cobranca.erro && (
                      <p className="text-sm text-red-400 mt-2">Erro: {cobranca.erro}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-salon-gold">Agenda de Cobrança</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-salon-gold" />
                  <Input
                    type="date"
                    value={collectionDateFilter}
                    onChange={(e) => setCollectionDateFilter(e.target.value)}
                    className="glass-card border-salon-gold/30 bg-transparent text-white w-40"
                    placeholder="Filtrar por data"
                  />
                  {collectionDateFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCollectionDateFilter('')}
                      className="text-salon-gold hover:bg-salon-gold/10"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const filteredAndSortedClients = getFilteredAndSortedClientsForCollection();
                
                if (filteredAndSortedClients.length === 0) {
                  return (
                    <p className="text-muted-foreground text-center py-8">
                      {collectionDateFilter 
                        ? 'Nenhum cliente agendado para esta data' 
                        : 'Nenhum cliente com saldo devedor'}
                    </p>
                  );
                }

                return filteredAndSortedClients.map((saldo) => (
                  <div key={saldo.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{saldo.cliente?.nome}</p>
                      <p className="text-sm text-salon-copper">{saldo.cliente?.telefone}</p>
                      <p className="text-xs text-muted-foreground">{saldo.cliente?.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-red-400 font-bold">R$ {saldo.saldo_devedor.toFixed(2)}</p>
                        <p className="text-xs text-green-400">
                          Pago: R$ {saldo.total_pago.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="date"
                          value={formatDateForInput(saldo.data_cobranca)}
                          onChange={(e) => handleCollectionDateChange(saldo.id, e.target.value)}
                          className="glass-card border-salon-gold/30 bg-transparent text-white w-40"
                          placeholder="Data de cobrança"
                        />
                        {saldo.data_cobranca && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            {formatDateForDisplay(saldo.data_cobranca)}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => sendWhatsAppCollection(saldo)}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        size="sm"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Cobrança */}
      <Dialog open={isCobrancaDialogOpen} onOpenChange={setIsCobrancaDialogOpen}>
        <DialogContent className="glass-card border-salon-gold/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">Nova Cobrança</DialogTitle>
          </DialogHeader>
          {selectedDivida && (
            <div className="space-y-4">
              <div className="p-3 glass-card rounded">
                <p className="text-white font-medium">{selectedDivida.devedor?.nome}</p>
                <p className="text-sm text-muted-foreground">{selectedDivida.descricao}</p>
                <p className="text-salon-gold font-bold">R$ {selectedDivida.valor_atual.toFixed(2)}</p>
              </div>
              <div>
                <Label>Tipo de Cobrança</Label>
                <Select value={cobrancaForm.tipo} onValueChange={(value: any) => setCobrancaForm({...cobrancaForm, tipo: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="ligacao">Ligação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mensagem</Label>
                <Textarea
                  value={cobrancaForm.mensagem}
                  onChange={(e) => setCobrancaForm({...cobrancaForm, mensagem: e.target.value})}
                  placeholder="Digite a mensagem de cobrança..."
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                  rows={4}
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleCreateCobranca} className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark">
                  Registrar Cobrança
                </Button>
                <Button variant="outline" onClick={() => setIsCobrancaDialogOpen(false)} className="border-salon-gold/30 text-salon-gold">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renderizar relatórios */}
      {renderRelatorioAberto()}
      {renderRelatorioRecebido()}
    </div>
  );
};

export default DebtCollectionManagement;
