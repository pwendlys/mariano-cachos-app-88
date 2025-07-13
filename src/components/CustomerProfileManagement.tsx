import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, User, DollarSign, History, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useCustomerProfiles } from '@/hooks/useCustomerProfiles';
import { useSupabaseScheduling } from '@/hooks/useSupabaseScheduling';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { format } from 'date-fns';

const CustomerProfileManagement = () => {
  const { 
    historicoAtendimentos, 
    saldosClientes, 
    loading, 
    createHistoricoAtendimento,
    updateHistoricoAtendimento,
    linkAgendamentoToHistorico,
    syncCustomerData
  } = useCustomerProfiles();
  
  const { appointments, services } = useSupabaseScheduling();
  const { products } = useSupabaseProducts();

  // Valor fixo do sinal sempre R$ 50,00
  const VALOR_SINAL_FIXO = 50.00;

  const [isHistoricoDialogOpen, setIsHistoricoDialogOpen] = useState(false);
  const [selectedHistorico, setSelectedHistorico] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);

  const [historicoForm, setHistoricoForm] = useState({
    cliente_id: '',
    agendamento_id: '',
    servicos_selecionados: [] as string[],
    produtos_selecionados: [] as string[],
    valor_servicos_extras: '',
    valor_produtos: '',
    valor_pendente: '',
    observacoes: '',
    status: 'pendente' as const
  });

  // Atualizar agendamento selecionado quando o agendamento_id mudar
  useEffect(() => {
    if (historicoForm.agendamento_id) {
      const agendamento = appointments.find(a => a.id === historicoForm.agendamento_id);
      setSelectedAgendamento(agendamento);
    } else {
      setSelectedAgendamento(null);
    }
  }, [historicoForm.agendamento_id, appointments]);

  const handleSyncCustomerData = async () => {
    setIsUpdating(true);
    try {
      await syncCustomerData();
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleServicoToggle = (servicoId: string) => {
    setHistoricoForm(prev => ({
      ...prev,
      servicos_selecionados: prev.servicos_selecionados.includes(servicoId)
        ? prev.servicos_selecionados.filter(id => id !== servicoId)
        : [...prev.servicos_selecionados, servicoId]
    }));
  };

  const handleProdutoToggle = (produtoId: string) => {
    setHistoricoForm(prev => ({
      ...prev,
      produtos_selecionados: prev.produtos_selecionados.includes(produtoId)
        ? prev.produtos_selecionados.filter(id => id !== produtoId)
        : [...prev.produtos_selecionados, produtoId]
    }));
  };

  const calcularTotalServicos = () => {
    const servicosSelecionados = services.filter(s => 
      historicoForm.servicos_selecionados.includes(s.id)
    );
    const totalServicos = servicosSelecionados.reduce((sum, s) => sum + s.preco, 0);
    const valorExtra = parseFloat(historicoForm.valor_servicos_extras) || 0;
    return totalServicos + valorExtra;
  };

  const calcularTotalProdutos = () => {
    const produtosSelecionados = products.filter(p => 
      historicoForm.produtos_selecionados.includes(p.id)
    );
    const totalProdutos = produtosSelecionados.reduce((sum, p) => sum + p.price, 0);
    const valorExtra = parseFloat(historicoForm.valor_produtos) || 0;
    return totalProdutos + valorExtra;
  };

  // Usar valor fixo do sinal se o agendamento foi pago
  const calcularSinalPago = () => {
    if (selectedAgendamento && selectedAgendamento.status_pagamento === 'pago') {
      return VALOR_SINAL_FIXO;
    }
    return 0;
  };

  // Calcular valor total do serviço do agendamento
  const calcularValorServicoAgendamento = () => {
    if (selectedAgendamento && selectedAgendamento.servico) {
      return selectedAgendamento.servico.preco;
    }
    return 0;
  };

  // Calcular total geral considerando o sinal
  const calcularTotalComSinal = () => {
    const valorServicoAgendamento = calcularValorServicoAgendamento();
    const totalServicosExtras = calcularTotalServicos();
    const totalProdutos = calcularTotalProdutos();
    const sinalPago = calcularSinalPago();
    
    const totalGeral = valorServicoAgendamento + totalServicosExtras + totalProdutos;
    return Math.max(0, totalGeral - sinalPago);
  };

  const handleCreateHistorico = async () => {
    try {
      const servicosSelecionados = services.filter(s => 
        historicoForm.servicos_selecionados.includes(s.id)
      ).map(s => ({ id: s.id, nome: s.nome, preco: s.preco }));

      const produtosSelecionados = products.filter(p => 
        historicoForm.produtos_selecionados.includes(p.id)
      ).map(p => ({ id: p.id, nome: p.name, preco: p.price }));

      // Incluir o serviço do agendamento se existir
      const servicosExtras = [...servicosSelecionados];
      let valorServicoAgendamento = 0;
      
      if (selectedAgendamento && selectedAgendamento.servico) {
        servicosExtras.push({
          id: selectedAgendamento.servico.id,
          nome: selectedAgendamento.servico.nome,
          preco: selectedAgendamento.servico.preco
        });
        valorServicoAgendamento = selectedAgendamento.servico.preco;
      }

      let observacoesCompletas = historicoForm.observacoes;
      
      // Adicionar informação do sinal se foi pago
      const sinalPago = calcularSinalPago();
      if (sinalPago > 0) {
        observacoesCompletas += `\nSinal pago: R$ ${sinalPago.toFixed(2)}`;
      }
      
      // Adicionar valor pendente se houver
      if (historicoForm.valor_pendente) {
        observacoesCompletas += `\nValor pendente: R$ ${historicoForm.valor_pendente}`;
      }

      // Usar os nomes corretos das colunas conforme o schema
      await createHistoricoAtendimento({
        cliente_id: historicoForm.cliente_id,
        agendamento_id: historicoForm.agendamento_id || null,
        servicos_extras: servicosExtras, // Esta coluna existe no schema
        produtos_vendidos: produtosSelecionados, // Esta é a coluna correta no schema
        valor_servicos_extras: valorServicoAgendamento + calcularTotalServicos(),
        valor_produtos: calcularTotalProdutos(),
        data_atendimento: new Date().toISOString(),
        observacoes: observacoesCompletas,
        status: historicoForm.status
      });
      
      // Resetar formulário
      setHistoricoForm({
        cliente_id: '',
        agendamento_id: '',
        servicos_selecionados: [],
        produtos_selecionados: [],
        valor_servicos_extras: '',
        valor_produtos: '',
        valor_pendente: '',
        observacoes: '',
        status: 'pendente'
      });
      setSelectedAgendamento(null);
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
          <Button 
            onClick={handleSyncCustomerData}
            disabled={isUpdating}
            variant="outline"
            className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
          >
            <RefreshCw className={`mr-2 ${isUpdating ? 'animate-spin' : ''}`} size={16} />
            {isUpdating ? 'Atualizando...' : 'Atualizar Dados'}
          </Button>
          <Dialog open={isHistoricoDialogOpen} onOpenChange={setIsHistoricoDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark">
                <Plus className="mr-2" size={16} />
                Novo Atendimento
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-salon-gold/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-salon-gold">Registrar Novo Atendimento</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
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

                {/* Mostrar serviço do agendamento se selecionado */}
                {selectedAgendamento && (
                  <div className="p-4 bg-salon-gold/10 rounded-lg border border-salon-gold/30">
                    <h4 className="text-salon-gold font-bold mb-2">Serviço do Agendamento</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{selectedAgendamento.servico?.nome}</p>
                        <p className="text-sm text-salon-copper">R$ {selectedAgendamento.servico?.preco?.toFixed(2)}</p>
                        {selectedAgendamento.status_pagamento === 'pago' && (
                          <p className="text-xs text-green-400">✓ Sinal pago: R$ {VALOR_SINAL_FIXO.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Seção Serviços */}
                <div>
                  <Label className="text-salon-gold text-lg">Serviços Extras Realizados</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {services.map(servico => (
                      <div key={servico.id} className="flex items-center space-x-3 p-3 glass-card rounded border border-salon-gold/20">
                        <Checkbox
                          checked={historicoForm.servicos_selecionados.includes(servico.id)}
                          onCheckedChange={() => handleServicoToggle(servico.id)}
                          className="border-salon-gold/50"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{servico.nome}</p>
                          <p className="text-sm text-salon-copper">R$ {servico.preco.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Label>Valor Extra de Serviços</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={historicoForm.valor_servicos_extras}
                      onChange={(e) => setHistoricoForm({...historicoForm, valor_servicos_extras: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  </div>
                  
                  <div className="mt-2 p-3 bg-salon-gold/10 rounded">
                    <p className="text-salon-gold font-bold">
                      Total Serviços Extras: R$ {calcularTotalServicos().toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Seção Produtos */}
                <div>
                  <Label className="text-salon-gold text-lg">Produtos Vendidos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {products.map(produto => (
                      <div key={produto.id} className="flex items-center space-x-3 p-3 glass-card rounded border border-salon-gold/20">
                        <Checkbox
                          checked={historicoForm.produtos_selecionados.includes(produto.id)}
                          onCheckedChange={() => handleProdutoToggle(produto.id)}
                          className="border-salon-gold/50"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{produto.name}</p>
                          <p className="text-sm text-salon-copper">R$ {produto.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{produto.brand}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Label>Valor Extra de Produtos</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={historicoForm.valor_produtos}
                      onChange={(e) => setHistoricoForm({...historicoForm, valor_produtos: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  </div>
                  
                  <div className="mt-2 p-3 bg-salon-gold/10 rounded">
                    <p className="text-salon-gold font-bold">
                      Total Produtos: R$ {calcularTotalProdutos().toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Valor Pendente */}
                <div>
                  <Label className="text-red-400">Valor Pendente (Ficou Faltando)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={historicoForm.valor_pendente}
                    onChange={(e) => setHistoricoForm({...historicoForm, valor_pendente: e.target.value})}
                    className="glass-card border-red-400/30 bg-transparent text-white"
                  />
                  <p className="text-xs text-red-400/70 mt-1">
                    Informe o valor que o cliente ainda precisa pagar
                  </p>
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
                    placeholder="Observações sobre o atendimento..."
                  />
                </div>

                {/* Resumo Total */}
                <div className="p-4 bg-salon-gold/20 rounded-lg border border-salon-gold/30">
                  <h4 className="text-salon-gold font-bold mb-2">Resumo Financeiro</h4>
                  <div className="space-y-1 text-sm">
                    {/* Mostrar serviço do agendamento */}
                    {selectedAgendamento && selectedAgendamento.servico && (
                      <div className="flex justify-between">
                        <span>{selectedAgendamento.servico.nome}:</span>
                        <span className="text-salon-gold">R$ {selectedAgendamento.servico.preco.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Total Serviços Extras:</span>
                      <span className="text-salon-gold">R$ {calcularTotalServicos().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Produtos:</span>
                      <span className="text-salon-gold">R$ {calcularTotalProdutos().toFixed(2)}</span>
                    </div>
                    
                    {/* Mostrar sinal pago se existir */}
                    {calcularSinalPago() > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Sinal Pago:</span>
                        <span>- R$ {calcularSinalPago().toFixed(2)}</span>
                      </div>
                    )}
                    
                    {historicoForm.valor_pendente && (
                      <div className="flex justify-between text-red-400">
                        <span>Valor Pendente:</span>
                        <span>R$ {parseFloat(historicoForm.valor_pendente || '0').toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-salon-gold/30 pt-2 font-bold">
                      <span>Total a Pagar:</span>
                      <span className="text-salon-gold">
                        R$ {calcularTotalComSinal().toFixed(2)}
                      </span>
                    </div>
                  </div>
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
