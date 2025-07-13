import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, AlertTriangle, CheckCircle, Clock, Users, Phone, Mail, UserCheck, FileText, X } from 'lucide-react';
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

const DebtCollectionManagement = () => {
  const { 
    devedores, 
    dividas, 
    cobrancas, 
    loading, 
    createDevedor, 
    createDivida, 
    updateDividaStatus,
    createCobranca,
    getTotals 
  } = useDebtCollection();

  const { saldosClientes, syncCustomerData } = useCustomerProfiles();

  const [isDevedorDialogOpen, setIsDevedorDialogOpen] = useState(false);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);
  const [isCobrancaDialogOpen, setIsCobrancaDialogOpen] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<Divida | null>(null);
  const [showReport, setShowReport] = useState<'aberto' | 'recebido' | null>(null);

  const [devedorForm, setDevedorForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    documento: '',
    observacoes: ''
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

  const handleCreateDevedor = async () => {
    try {
      // Criar cliente na tabela clientes para que apareça no novo atendimento
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          nome: devedorForm.nome,
          telefone: devedorForm.telefone.replace(/\D/g, ''),
          email: devedorForm.email || '',
          endereco: devedorForm.endereco
        })
        .select()
        .single();

      if (clienteError) {
        console.error('Erro ao criar cliente:', clienteError);
        return;
      }

      // Criar devedor na tabela devedores
      await createDevedor({
        ...devedorForm,
        telefone: devedorForm.telefone.replace(/\D/g, '') // Remove caracteres não numéricos
      });

      setDevedorForm({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        documento: '',
        observacoes: ''
      });
      setIsDevedorDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar cliente/devedor:', error);
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

  // Renderizar relatório de clientes em aberto
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

  // Renderizar relatório de clientes com valores recebidos
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
            <DialogContent className="glass-card border-salon-gold/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-salon-gold">Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={devedorForm.nome}
                    onChange={(e) => setDevedorForm({...devedorForm, nome: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
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
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={devedorForm.email}
                    onChange={(e) => setDevedorForm({...devedorForm, email: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input
                    value={devedorForm.documento}
                    onChange={(e) => setDevedorForm({...devedorForm, documento: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Textarea
                    value={devedorForm.endereco}
                    onChange={(e) => setDevedorForm({...devedorForm, endereco: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={devedorForm.observacoes}
                    onChange={(e) => setDevedorForm({...devedorForm, observacoes: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleCreateDevedor} className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark">
                    Criar Cliente
                  </Button>
                  <Button variant="outline" onClick={() => setIsDevedorDialogOpen(false)} className="border-salon-gold/30 text-salon-gold">
                    Cancelar
                  </Button>
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

      {/* Cards de Resumo */}
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
              R$ {saldosClientes.reduce((sum, cliente) => sum + cliente.saldo_devedor, 0).toFixed(2)}
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
              R$ {saldosClientes.reduce((sum, cliente) => sum + cliente.total_pago, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver relatório</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center gap-2 text-sm">
              <Clock size={16} />
              Parcelado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {getTotals.totalParcelado.toFixed(2)}
            </div>
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

      {/* Tabs with new Customer Profiles tab */}
      <Tabs defaultValue="perfis" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="perfis">Perfis de Clientes</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas</TabsTrigger>
          <TabsTrigger value="devedores">Devedores</TabsTrigger>
          <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
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
