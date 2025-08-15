
import React, { useState, useEffect } from 'react';
import { useDebtCollection } from '@/hooks/useDebtCollection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MessageCircle, Phone, Mail, DollarSign, Users, FileText, Calendar as CalendarDays, Plus, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const DebtCollectionsDashboard = () => {
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

  const [activeTab, setActiveTab] = useState('saldos');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newDevedorOpen, setNewDevedorOpen] = useState(false);
  const [newDividaOpen, setNewDividaOpen] = useState(false);
  const [newDevedorData, setNewDevedorData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    documento: '',
    observacoes: ''
  });
  const [newDividaData, setNewDividaData] = useState({
    devedor_id: '',
    descricao: '',
    valor_original: '',
    valor_atual: '',
    data_vencimento: '',
    observacoes: ''
  });

  const handleCreateDevedor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDevedor({
        nome: newDevedorData.nome,
        telefone: newDevedorData.telefone,
        email: newDevedorData.email || undefined,
        endereco: newDevedorData.endereco || undefined,
        documento: newDevedorData.documento || undefined,
        observacoes: newDevedorData.observacoes || undefined
      });
      setNewDevedorOpen(false);
      setNewDevedorData({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        documento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar devedor:', error);
    }
  };

  const handleCreateDivida = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDivida({
        devedor_id: newDividaData.devedor_id,
        descricao: newDividaData.descricao,
        valor_original: parseFloat(newDividaData.valor_original),
        valor_atual: parseFloat(newDividaData.valor_atual),
        data_vencimento: newDividaData.data_vencimento,
        status: 'em_aberto',
        observacoes: newDividaData.observacoes || undefined
      });
      setNewDividaOpen(false);
      setNewDividaData({
        devedor_id: '',
        descricao: '',
        valor_original: '',
        valor_atual: '',
        data_vencimento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar dívida:', error);
    }
  };

  const handleUpdateCollectionDate = async (saldoId: string, date: Date | null) => {
    const dateString = date ? format(date, 'yyyy-MM-dd') : null;
    await updateCollectionDate(saldoId, dateString);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'em_aberto': { label: 'Em Aberto', variant: 'destructive' as const },
      'pago': { label: 'Pago', variant: 'default' as const },
      'parcelado': { label: 'Parcelado', variant: 'secondary' as const },
      'cancelado': { label: 'Cancelado', variant: 'outline' as const },
      'pendente': { label: 'Pendente', variant: 'secondary' as const },
      'enviado': { label: 'Enviado', variant: 'default' as const },
      'entregue': { label: 'Entregue', variant: 'default' as const },
      'lido': { label: 'Lido', variant: 'default' as const },
      'respondido': { label: 'Respondido', variant: 'default' as const },
      'erro': { label: 'Erro', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(getTotals.totalEmAberto)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotals.totalRecebido)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes com Saldo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {saldosClientes.filter(s => s.saldo_devedor > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Devedores</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devedores.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="saldos">Saldos Clientes</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas</TabsTrigger>
          <TabsTrigger value="devedores">Devedores</TabsTrigger>
          <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
          <TabsTrigger value="agenda">Agenda Cobrança</TabsTrigger>
        </TabsList>

        {/* Client Balances Tab */}
        <TabsContent value="saldos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saldos dos Clientes</CardTitle>
              <CardDescription>
                Clientes com saldo devedor no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Saldo Devedor</TableHead>
                    <TableHead>Total Pago</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead>Data Cobrança</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saldosClientes.filter(s => s.saldo_devedor > 0).map((saldo) => (
                    <TableRow key={saldo.id}>
                      <TableCell className="font-medium">
                        {saldo.cliente?.nome || 'Cliente não identificado'}
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {formatCurrency(saldo.saldo_devedor)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(saldo.total_pago)}
                      </TableCell>
                      <TableCell>
                        {formatDate(saldo.ultima_atualizacao)}
                      </TableCell>
                      <TableCell>
                        {saldo.data_cobranca ? formatDate(saldo.data_cobranca) : 'Não agendada'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendWhatsAppCollection(saldo)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            WhatsApp
                          </Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button size="sm" variant="outline">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Agendar
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={saldo.data_cobranca ? new Date(saldo.data_cobranca) : undefined}
                                onSelect={(date) => handleUpdateCollectionDate(saldo.id, date || null)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debts Tab */}
        <TabsContent value="dividas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Dívidas Registradas</h3>
            <Dialog open={newDividaOpen} onOpenChange={setNewDividaOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Dívida
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Dívida</DialogTitle>
                  <DialogDescription>
                    Cadastre uma nova dívida no sistema
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDivida} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="devedor">Devedor</Label>
                    <Select
                      value={newDividaData.devedor_id}
                      onValueChange={(value) => setNewDividaData({...newDividaData, devedor_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um devedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {devedores.map((devedor) => (
                          <SelectItem key={devedor.id} value={devedor.id}>
                            {devedor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={newDividaData.descricao}
                      onChange={(e) => setNewDividaData({...newDividaData, descricao: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor_original">Valor Original</Label>
                      <Input
                        id="valor_original"
                        type="number"
                        step="0.01"
                        value={newDividaData.valor_original}
                        onChange={(e) => setNewDividaData({...newDividaData, valor_original: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor_atual">Valor Atual</Label>
                      <Input
                        id="valor_atual"
                        type="number"
                        step="0.01"
                        value={newDividaData.valor_atual}
                        onChange={(e) => setNewDividaData({...newDividaData, valor_atual: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={newDividaData.data_vencimento}
                      onChange={(e) => setNewDividaData({...newDividaData, data_vencimento: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={newDividaData.observacoes}
                      onChange={(e) => setNewDividaData({...newDividaData, observacoes: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Registrar Dívida
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Devedor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Valor Atual</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividas.map((divida) => (
                    <TableRow key={divida.id}>
                      <TableCell className="font-medium">
                        {divida.devedor?.nome || 'Devedor não encontrado'}
                      </TableCell>
                      <TableCell>{divida.descricao}</TableCell>
                      <TableCell>{formatCurrency(divida.valor_original)}</TableCell>
                      <TableCell className={divida.status === 'em_aberto' ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {formatCurrency(divida.valor_atual)}
                      </TableCell>
                      <TableCell>{formatDate(divida.data_vencimento)}</TableCell>
                      <TableCell>{getStatusBadge(divida.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={divida.status}
                          onValueChange={(value) => updateDividaStatus(divida.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="em_aberto">Em Aberto</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="parcelado">Parcelado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debtors Tab */}
        <TabsContent value="devedores" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Devedores Cadastrados</h3>
            <Dialog open={newDevedorOpen} onOpenChange={setNewDevedorOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Devedor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Devedor</DialogTitle>
                  <DialogDescription>
                    Adicione um novo devedor ao sistema
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDevedor} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={newDevedorData.nome}
                      onChange={(e) => setNewDevedorData({...newDevedorData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={newDevedorData.telefone}
                      onChange={(e) => setNewDevedorData({...newDevedorData, telefone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDevedorData.email}
                      onChange={(e) => setNewDevedorData({...newDevedorData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento">Documento</Label>
                    <Input
                      id="documento"
                      value={newDevedorData.documento}
                      onChange={(e) => setNewDevedorData({...newDevedorData, documento: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={newDevedorData.endereco}
                      onChange={(e) => setNewDevedorData({...newDevedorData, endereco: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={newDevedorData.observacoes}
                      onChange={(e) => setNewDevedorData({...newDevedorData, observacoes: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Cadastrar Devedor
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devedores.map((devedor) => (
                    <TableRow key={devedor.id}>
                      <TableCell className="font-medium">{devedor.nome}</TableCell>
                      <TableCell>{devedor.telefone}</TableCell>
                      <TableCell>{devedor.email || '-'}</TableCell>
                      <TableCell>{devedor.documento || '-'}</TableCell>
                      <TableCell>{formatDate(devedor.created_at)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Contatar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="cobrancas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cobranças</CardTitle>
              <CardDescription>
                Registro de todas as tentativas de cobrança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tentativa</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Resposta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cobrancas.map((cobranca) => (
                    <TableRow key={cobranca.id}>
                      <TableCell>{formatDate(cobranca.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cobranca.tipo.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(cobranca.status)}</TableCell>
                      <TableCell>{cobranca.tentativa}ª</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {cobranca.mensagem || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {cobranca.resposta || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collection Schedule Tab */}
        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de Cobranças</CardTitle>
              <CardDescription>
                Clientes com cobrança agendada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Saldo Devedor</TableHead>
                    <TableHead>Data Agendada</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saldosClientes.filter(s => s.data_cobranca).map((saldo) => (
                    <TableRow key={saldo.id}>
                      <TableCell className="font-medium">
                        {saldo.cliente?.nome || 'Cliente não identificado'}
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {formatCurrency(saldo.saldo_devedor)}
                      </TableCell>
                      <TableCell>
                        {saldo.data_cobranca ? formatDate(saldo.data_cobranca) : '-'}
                      </TableCell>
                      <TableCell>{saldo.cliente?.telefone || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => sendWhatsAppCollection(saldo)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar Cobrança
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateCollectionDate(saldo.id, null)}
                          >
                            Cancelar Agenda
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebtCollectionsDashboard;
