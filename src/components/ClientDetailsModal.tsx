
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar, DollarSign, User, Phone, Mail, MapPin, Save, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useSupabaseScheduling } from '@/hooks/useSupabaseScheduling';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  created_at: string;
}

interface Agendamento {
  id: string;
  data: string;
  horario: string;
  valor: number;
  status: string;
  status_pagamento: string;
  observacoes?: string;
  servico: {
    nome: string;
    preco: number;
  };
}

interface HistoricoAtendimento {
  id: string;
  data_atendimento: string;
  servicos_extras: any[];
  produtos_vendidos: any[];
  valor_servicos_extras: number;
  valor_produtos: number;
  observacoes?: string;
  status: string;
}

interface ClientDetailsModalProps {
  cliente: Cliente;
  onUpdate: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ cliente, onUpdate }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [historico, setHistorico] = useState<HistoricoAtendimento[]>([]);
  const [saldo, setSaldo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCliente, setEditedCliente] = useState(cliente);
  const [loading, setLoading] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  
  const { services } = useSupabaseScheduling();
  const { products } = useSupabaseProducts();
  const { toast } = useToast();

  // Estados para novo pagamento
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentObservation, setPaymentObservation] = useState('');

  // Estados para novo serviço/produto
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [serviceObservation, setServiceObservation] = useState('');

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Buscar agendamentos
      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          servico:servicos(nome, preco)
        `)
        .eq('cliente_id', cliente.id)
        .order('data', { ascending: false });

      if (agendamentosError) throw agendamentosError;

      // Buscar histórico
      const { data: historicoData, error: historicoError } = await supabase
        .from('historico_atendimentos')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('data_atendimento', { ascending: false });

      if (historicoError) throw historicoError;

      // Buscar saldo
      const { data: saldoData, error: saldoError } = await supabase
        .from('saldos_clientes')
        .select('*')
        .eq('cliente_id', cliente.id)
        .maybeSingle();

      if (saldoError) throw saldoError;

      setAgendamentos(agendamentosData || []);
      setHistorico(historicoData || []);
      setSaldo(saldoData);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [cliente.id]);

  const handleUpdateCliente = async () => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nome: editedCliente.nome,
          email: editedCliente.email,
          telefone: editedCliente.telefone,
          endereco: editedCliente.endereco,
          updated_at: new Date().toISOString()
        })
        .eq('id', cliente.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente.",
        variant: "destructive"
      });
    }
  };

  const handleAddPayment = async () => {
    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Erro",
          description: "Informe um valor válido para o pagamento.",
          variant: "destructive"
        });
        return;
      }

      // Criar registro no histórico como pagamento
      const { error } = await supabase
        .from('historico_atendimentos')
        .insert({
          cliente_id: cliente.id,
          data_atendimento: new Date().toISOString(),
          servicos_extras: [],
          produtos_vendidos: [],
          valor_servicos_extras: 0,
          valor_produtos: 0,
          observacoes: `Pagamento recebido: R$ ${amount.toFixed(2)}${paymentObservation ? '\n' + paymentObservation : ''}`,
          status: 'concluido'
        });

      if (error) throw error;

      // Atualizar saldo
      await updateClientBalance();

      setPaymentAmount('');
      setPaymentObservation('');
      setIsAddingPayment(false);
      fetchClientData();
      
      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleAddService = async () => {
    try {
      const servicosSelecionados = services.filter(s => selectedServices.includes(s.id));
      const produtosSelecionados = products.filter(p => selectedProducts.includes(p.id));

      const valorServicos = servicosSelecionados.reduce((sum, s) => sum + s.preco, 0);
      const valorProdutos = produtosSelecionados.reduce((sum, p) => sum + p.price, 0);

      const servicosData = servicosSelecionados.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: s.preco
      }));

      const produtosData = produtosSelecionados.map(p => ({
        id: p.id,
        nome: p.name,
        preco: p.price
      }));

      const { error } = await supabase
        .from('historico_atendimentos')
        .insert({
          cliente_id: cliente.id,
          data_atendimento: new Date().toISOString(),
          servicos_extras: servicosData,
          produtos_vendidos: produtosData,
          valor_servicos_extras: valorServicos,
          valor_produtos: valorProdutos,
          observacoes: serviceObservation,
          status: 'concluido'
        });

      if (error) throw error;

      // Atualizar saldo
      await updateClientBalance();

      setSelectedServices([]);
      setSelectedProducts([]);
      setServiceObservation('');
      setIsAddingService(false);
      fetchClientData();
      
      toast({
        title: "Sucesso",
        description: "Serviços/produtos adicionados com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao adicionar serviços:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os serviços/produtos.",
        variant: "destructive"
      });
    }
  };

  const updateClientBalance = async () => {
    try {
      // Recalcular saldo do cliente
      const { data: historicoData } = await supabase
        .from('historico_atendimentos')
        .select('valor_servicos_extras, valor_produtos, status, observacoes')
        .eq('cliente_id', cliente.id)
        .eq('status', 'concluido');

      const totalServicos = historicoData?.reduce((sum, h) => sum + (h.valor_servicos_extras || 0), 0) || 0;
      const totalProdutos = historicoData?.reduce((sum, h) => sum + (h.valor_produtos || 0), 0) || 0;

      // Calcular pagamentos das observações
      let totalPago = 0;
      historicoData?.forEach(h => {
        if (h.observacoes) {
          const pagamentoMatch = h.observacoes.match(/Pagamento recebido: R\$ ([\d,]+\.?\d*)/);
          if (pagamentoMatch) {
            totalPago += parseFloat(pagamentoMatch[1].replace(',', ''));
          }
        }
      });

      // Calcular sinal pago dos agendamentos
      const { data: agendamentosPagos } = await supabase
        .from('agendamentos')
        .select('status_pagamento')
        .eq('cliente_id', cliente.id)
        .eq('status_pagamento', 'pago');

      const sinalPago = (agendamentosPagos?.length || 0) * 50; // R$ 50 por agendamento pago
      totalPago += sinalPago;

      const saldoDevedor = Math.max(0, (totalServicos + totalProdutos) - totalPago);

      await supabase
        .from('saldos_clientes')
        .upsert({
          cliente_id: cliente.id,
          saldo_devedor: saldoDevedor,
          total_pago: totalPago,
          total_servicos: totalServicos,
          total_produtos: totalProdutos,
          ultima_atualizacao: new Date().toISOString()
        }, {
          onConflict: 'cliente_id'
        });
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmado': return 'bg-blue-500/20 text-blue-400';
      case 'concluido': return 'bg-green-500/20 text-green-400';
      case 'cancelado': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="glass-card grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        {/* Aba Informações */}
        <TabsContent value="info" className="space-y-4">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-salon-gold flex items-center gap-2">
                <User size={20} />
                Dados do Cliente
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-salon-gold/30 text-salon-gold"
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  {isEditing ? (
                    <Input
                      value={editedCliente.nome}
                      onChange={(e) => setEditedCliente({...editedCliente, nome: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  ) : (
                    <p className="text-white p-2">{cliente.nome}</p>
                  )}
                </div>
                <div>
                  <Label>Telefone</Label>
                  {isEditing ? (
                    <Input
                      value={editedCliente.telefone}
                      onChange={(e) => setEditedCliente({...editedCliente, telefone: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  ) : (
                    <p className="text-white p-2">{cliente.telefone}</p>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      value={editedCliente.email}
                      onChange={(e) => setEditedCliente({...editedCliente, email: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  ) : (
                    <p className="text-white p-2">{cliente.email}</p>
                  )}
                </div>
                <div>
                  <Label>Endereço</Label>
                  {isEditing ? (
                    <Input
                      value={editedCliente.endereco || ''}
                      onChange={(e) => setEditedCliente({...editedCliente, endereco: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                      placeholder="Endereço completo"
                    />
                  ) : (
                    <p className="text-white p-2">{cliente.endereco || 'Não informado'}</p>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <Button 
                  onClick={handleUpdateCliente}
                  className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
                >
                  <Save className="mr-2" size={16} />
                  Salvar Alterações
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Agendamentos */}
        <TabsContent value="agendamentos" className="space-y-4">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader>
              <CardTitle className="text-salon-gold">Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {agendamentos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum agendamento encontrado
                </p>
              ) : (
                <div className="space-y-3">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="p-4 glass-card rounded border border-salon-gold/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">{agendamento.servico.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(agendamento.data), "dd/MM/yyyy")} às {agendamento.horario}
                          </p>
                          <p className="text-salon-gold font-bold">R$ {agendamento.valor?.toFixed(2)}</p>
                          {agendamento.observacoes && (
                            <p className="text-xs text-salon-copper mt-1">{agendamento.observacoes}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(agendamento.status)}>
                            {agendamento.status}
                          </Badge>
                          <Badge className={agendamento.status_pagamento === 'pago' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {agendamento.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Histórico */}
        <TabsContent value="historico" className="space-y-4">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-salon-gold">Histórico de Atendimentos</CardTitle>
              <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
                <DialogTrigger asChild>
                  <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark">
                    <Plus className="mr-2" size={16} />
                    Adicionar Serviço/Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-salon-gold/30 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-salon-gold">Adicionar Serviço/Produto</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Serviços</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                        {services.map(service => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedServices([...selectedServices, service.id]);
                                } else {
                                  setSelectedServices(selectedServices.filter(id => id !== service.id));
                                }
                              }}
                            />
                            <span className="text-white">{service.nome} - R$ {service.preco.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Produtos</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                        {products.map(product => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProducts([...selectedProducts, product.id]);
                                } else {
                                  setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                }
                              }}
                            />
                            <span className="text-white">{product.name} - R$ {product.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={serviceObservation}
                        onChange={(e) => setServiceObservation(e.target.value)}
                        className="glass-card border-salon-gold/30 bg-transparent text-white"
                        placeholder="Observações sobre o atendimento..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddService}
                        className="bg-salon-gold hover:bg-salon-copper text-salon-dark flex-1"
                        disabled={selectedServices.length === 0 && selectedProducts.length === 0}
                      >
                        Adicionar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingService(false)}
                        className="border-salon-gold/30 text-salon-gold"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {historico.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum histórico encontrado
                </p>
              ) : (
                <div className="space-y-3">
                  {historico.map((item) => (
                    <div key={item.id} className="p-4 glass-card rounded border border-salon-gold/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(item.data_atendimento), "dd/MM/yyyy HH:mm")}
                          </p>
                          <div className="mt-2">
                            <p className="text-white font-medium">
                              Serviços: R$ {item.valor_servicos_extras.toFixed(2)} | 
                              Produtos: R$ {item.valor_produtos.toFixed(2)}
                            </p>
                            <p className="text-salon-gold font-bold">
                              Total: R$ {(item.valor_servicos_extras + item.valor_produtos).toFixed(2)}
                            </p>
                          </div>
                          {item.observacoes && (
                            <p className="text-xs text-salon-copper mt-2">{item.observacoes}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <Card className="glass-card border-salon-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-salon-gold">Situação Financeira</CardTitle>
              <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <DollarSign className="mr-2" size={16} />
                    Registrar Pagamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-salon-gold/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-salon-gold">Registrar Pagamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Valor do Pagamento</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="glass-card border-salon-gold/30 bg-transparent text-white"
                      />
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={paymentObservation}
                        onChange={(e) => setPaymentObservation(e.target.value)}
                        className="glass-card border-salon-gold/30 bg-transparent text-white"
                        placeholder="Observações sobre o pagamento..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddPayment}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        disabled={!paymentAmount}
                      >
                        Registrar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingPayment(false)}
                        className="border-salon-gold/30 text-salon-gold"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {saldo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 glass-card rounded border border-red-500/20">
                    <h4 className="text-red-400 font-medium">Saldo Devedor</h4>
                    <p className="text-2xl font-bold text-red-400">R$ {saldo.saldo_devedor.toFixed(2)}</p>
                  </div>
                  <div className="p-4 glass-card rounded border border-green-500/20">
                    <h4 className="text-green-400 font-medium">Total Pago</h4>
                    <p className="text-2xl font-bold text-green-400">R$ {saldo.total_pago.toFixed(2)}</p>
                  </div>
                  <div className="p-4 glass-card rounded border border-salon-gold/20">
                    <h4 className="text-salon-gold font-medium">Total Serviços</h4>
                    <p className="text-2xl font-bold text-salon-gold">R$ {saldo.total_servicos.toFixed(2)}</p>
                  </div>
                  <div className="p-4 glass-card rounded border border-salon-copper/20">
                    <h4 className="text-salon-copper font-medium">Total Produtos</h4>
                    <p className="text-2xl font-bold text-salon-copper">R$ {saldo.total_produtos.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum dado financeiro encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailsModal;
