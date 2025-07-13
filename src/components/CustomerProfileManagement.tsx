
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, User, DollarSign, History, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCustomerProfiles } from '@/hooks/useCustomerProfiles';
import { useSupabaseScheduling } from '@/hooks/useSupabaseScheduling';
import { format } from 'date-fns';

const CustomerProfileManagement = () => {
  const { 
    historicoAtendimentos, 
    saldosClientes, 
    loading, 
    createHistoricoAtendimento,
    updateHistoricoAtendimento,
    linkAgendamentoToHistorico
  } = useCustomerProfiles();
  
  const { appointments, services } = useSupabaseScheduling();

  const [isHistoricoDialogOpen, setIsHistoricoDialogOpen] = useState(false);
  const [selectedHistorico, setSelectedHistorico] = useState<any>(null);

  const [historicoForm, setHistoricoForm] = useState({
    cliente_id: '',
    agendamento_id: '',
    servicos_extras: [],
    produtos_vendidos: [],
    valor_servicos_extras: '',
    valor_produtos: '',
    observacoes: '',
    status: 'pendente' as const
  });

  const handleCreateHistorico = async () => {
    try {
      await createHistoricoAtendimento({
        ...historicoForm,
        valor_servicos_extras: parseFloat(historicoForm.valor_servicos_extras) || 0,
        valor_produtos: parseFloat(historicoForm.valor_produtos) || 0,
        data_atendimento: new Date().toISOString()
      });
      
      setHistoricoForm({
        cliente_id: '',
        agendamento_id: '',
        servicos_extras: [],
        produtos_vendidos: [],
        valor_servicos_extras: '',
        valor_produtos: '',
        observacoes: '',
        status: 'pendente'
      });
      setIsHistoricoDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar histórico:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateHistoricoAtendimento(id, { status: status as any });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400';
      case 'concluido': return 'bg-green-500/20 text-green-400';
      case 'cancelado': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const clientesComSaldo = saldosClientes.filter(s => s.saldo_devedor > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Perfis de Clientes</h2>
        <div className="flex gap-2">
          <Dialog open={isHistoricoDialogOpen} onOpenChange={setIsHistoricoDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark">
                <Plus className="mr-2" size={16} />
                Novo Atendimento
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-salon-gold/30 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-salon-gold">Registrar Novo Atendimento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Agendamento Base</Label>
                  <Select value={historicoForm.agendamento_id} onValueChange={(value) => {
                    setHistoricoForm({...historicoForm, agendamento_id: value});
                    const agendamento = appointments.find(a => a.id === value);
                    if (agendamento) {
                      setHistoricoForm(prev => ({...prev, cliente_id: agendamento.cliente_id}));
                    }
                  }}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                      <SelectValue placeholder="Selecione um agendamento" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      {appointments.map(agendamento => (
                        <SelectItem key={agendamento.id} value={agendamento.id}>
                          {agendamento.cliente?.nome} - {agendamento.servico?.nome} - {format(new Date(agendamento.data), "dd/MM/yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Serviços Extras</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={historicoForm.valor_servicos_extras}
                      onChange={(e) => setHistoricoForm({...historicoForm, valor_servicos_extras: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  </div>
                  <div>
                    <Label>Valor Produtos</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={historicoForm.valor_produtos}
                      onChange={(e) => setHistoricoForm({...historicoForm, valor_produtos: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={historicoForm.status} onValueChange={(value: any) => setHistoricoForm({...historicoForm, status: value})}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={historicoForm.observacoes}
                    onChange={(e) => setHistoricoForm({...historicoForm, observacoes: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button onClick={handleCreateHistorico} className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark">
                    Registrar Atendimento
                  </Button>
                  <Button variant="outline" onClick={() => setIsHistoricoDialogOpen(false)} className="border-salon-gold/30 text-salon-gold">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-salon-gold/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-salon-gold flex items-center gap-2 text-sm">
              <User size={16} />
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {saldosClientes.length}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 flex items-center gap-2 text-sm">
              <AlertTriangle size={16} />
              Com Saldo Devedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {clientesComSaldo.length}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2 text-sm">
              <DollarSign size={16} />
              Total em Dívidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {clientesComSaldo.reduce((sum, s) => sum + s.saldo_devedor, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="historico" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="historico">Histórico de Atendimentos</TabsTrigger>
          <TabsTrigger value="saldos">Saldos dos Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="historico">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold">Histórico de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {historicoAtendimentos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum atendimento registrado
                </p>
              ) : (
                historicoAtendimentos.map((historico) => (
                  <div key={historico.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-white font-medium">{historico.cliente?.nome}</p>
                        <Badge className={getStatusColor(historico.status)}>
                          {historico.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(historico.data_atendimento), "dd/MM/yyyy HH:mm")}
                      </p>
                      {historico.observacoes && (
                        <p className="text-xs text-salon-copper mt-1">{historico.observacoes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold">
                          R$ {(historico.valor_servicos_extras + historico.valor_produtos).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Serv: R$ {historico.valor_servicos_extras.toFixed(2)} | Prod: R$ {historico.valor_produtos.toFixed(2)}
                        </p>
                      </div>
                      <Select 
                        value={historico.status} 
                        onValueChange={(value) => handleUpdateStatus(historico.id, value)}
                      >
                        <SelectTrigger className="w-32 glass-card border-salon-gold/30 bg-transparent text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-salon-gold/30">
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saldos">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold">Saldos dos Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {saldosClientes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum saldo registrado
                </p>
              ) : (
                saldosClientes.map((saldo) => (
                  <div key={saldo.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div>
                      <p className="text-white font-medium">{saldo.cliente?.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Última atualização: {format(new Date(saldo.ultima_atualizacao), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Saldo Devedor</p>
                          <p className={`font-bold ${saldo.saldo_devedor > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            R$ {saldo.saldo_devedor.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Pago</p>
                          <p className="text-white font-bold">R$ {saldo.total_pago.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Serviços</p>
                          <p className="text-salon-gold">R$ {saldo.total_servicos.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Produtos</p>
                          <p className="text-salon-copper">R$ {saldo.total_produtos.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerProfileManagement;
