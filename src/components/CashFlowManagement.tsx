import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Eye, Filter, Calendar, CreditCard, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseCashFlow, CashFlowFilters as CashFlowFiltersType } from '@/hooks/useSupabaseCashFlow';
import CashFlowFilters from '@/components/CashFlowFilters';
import AppointmentsTab from '@/components/AppointmentsTab';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CashFlowManagement = () => {
  const { 
    entries, 
    clients, 
    professionals, 
    appointments, 
    loading, 
    fetchEntries, 
    addEntry, 
    updateAppointmentCollectionStatus 
  } = useSupabaseCashFlow();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(false);
  const [filters, setFilters] = useState<CashFlowFiltersType>({
    filterType: 'all'
  });
  
  const [formData, setFormData] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    categoria: '',
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    cliente_id: '',
    profissional_id: '',
    observacoes: ''
  });

  const handleFilterChange = (newFilters: CashFlowFiltersType) => {
    setFilters(newFilters);
    fetchEntries(newFilters);
  };

  const handleAddEntry = async () => {
    if (!formData.categoria || !formData.descricao || formData.valor <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Get names from selected IDs
    const selectedClient = clients.find(c => c.id === formData.cliente_id);
    const selectedProfessional = professionals.find(p => p.id === formData.profissional_id);

    try {
      await addEntry({
        tipo: formData.tipo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: formData.valor,
        data: formData.data,
        cliente_nome: selectedClient?.nome || null,
        profissional_nome: selectedProfessional?.nome || null,
        origem_tipo: 'manual',
        origem_id: null,
        metadata: formData.observacoes ? { observacoes: formData.observacoes } : {}
      });
      
      setIsAddDialogOpen(false);
      setFormData({
        tipo: 'entrada',
        categoria: '',
        descricao: '',
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        cliente_id: '',
        profissional_id: '',
        observacoes: ''
      });
      
      fetchEntries(filters);
    } catch (error) {
      // Error handled in hook
    }
  };

  const showDetails = (entry: any) => {
    setSelectedEntry(entry);
    setIsDetailsDialogOpen(true);
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      'Serviços': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Produtos': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Comissões': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Despesas': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Outros': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[categoria as keyof typeof colors] || colors['Outros'];
  };

  const getOriginTypeLabel = (origem_tipo: string | null) => {
    const labels = {
      'agendamento': 'Agendamento',
      'venda': 'Venda',
      'comissao_agendamento': 'Comissão Serviço',
      'comissao_venda': 'Comissão Produto',
      'manual': 'Manual'
    };
    return labels[origem_tipo as keyof typeof labels] || 'Não informado';
  };

  const getTotalBalance = () => {
    const entradas = entries.filter(e => e.tipo === 'entrada').reduce((sum, e) => sum + Number(e.valor), 0);
    const saidas = entries.filter(e => e.tipo === 'saida').reduce((sum, e) => sum + Number(e.valor), 0);
    return entradas - saidas;
  };

  const getTotalEntradas = () => {
    return entries.filter(e => e.tipo === 'entrada').reduce((sum, e) => sum + Number(e.valor), 0);
  };

  const getTotalSaidas = () => {
    return entries.filter(e => e.tipo === 'saida').reduce((sum, e) => sum + Number(e.valor), 0);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      setDeletingEntry(true);
      
      const { error } = await supabase
        .from('fluxo_caixa')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Erro ao excluir lançamento:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir o lançamento. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso.",
      });

      setIsDetailsDialogOpen(false);
      setIsDeleteDialogOpen(false);
      fetchEntries(filters);
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir o lançamento.",
        variant: "destructive"
      });
    } finally {
      setDeletingEntry(false);
    }
  };

  const isAdmin = user?.tipo === 'admin';

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando fluxo de caixa...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Gestão Financeira</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium">
              <Plus className="mr-2" size={16} />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">Novo Lançamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo *</label>
                  <Select value={formData.tipo} onValueChange={(value: 'entrada' | 'saida') => setFormData({...formData, tipo: value})}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data *</label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Categoria *</label>
                <Input
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  placeholder="Ex: Despesas, Outros"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição *</label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição do lançamento"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Valor *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cliente</label>
                  <Select value={formData.cliente_id || 'none'} onValueChange={(value) => setFormData({...formData, cliente_id: value === 'none' ? '' : value})}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      <SelectItem value="none">Nenhum cliente</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Profissional</label>
                  <Select value={formData.profissional_id || 'none'} onValueChange={(value) => setFormData({...formData, profissional_id: value === 'none' ? '' : value})}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      <SelectItem value="none">Nenhum profissional</SelectItem>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          {professional.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações adicionais"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleAddEntry}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium"
                >
                  Adicionar Lançamento
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Total Entradas</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {getTotalEntradas().toFixed(2)}
                </p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Total Saídas</p>
                <p className="text-2xl font-bold text-red-400">
                  R$ {getTotalSaidas().toFixed(2)}
                </p>
              </div>
              <TrendingDown className="text-red-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className={`glass-card ${getTotalBalance() >= 0 ? 'border-salon-gold/20' : 'border-red-500/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-salon-copper">Saldo Total</p>
                <p className={`text-2xl font-bold ${getTotalBalance() >= 0 ? 'text-salon-gold' : 'text-red-400'}`}>
                  R$ {getTotalBalance().toFixed(2)}
                </p>
              </div>
              <DollarSign className={getTotalBalance() >= 0 ? 'text-salon-gold' : 'text-red-400'} size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cashflow" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card border-salon-gold/30">
          <TabsTrigger value="cashflow" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark">
            <DollarSign className="mr-2" size={16} />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark">
            <Calendar className="mr-2" size={16} />
            Atendimentos
          </TabsTrigger>
          <TabsTrigger value="collections" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark">
            <CreditCard className="mr-2" size={16} />
            Cobranças
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashflow" className="space-y-6">
          <CashFlowFilters
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(date) => handleFilterChange({...filters, startDate: date})}
            onEndDateChange={(date) => handleFilterChange({...filters, endDate: date})}
            filterType={filters.filterType}
            onFilterTypeChange={(type) => handleFilterChange({...filters, filterType: type})}
            onClearFilters={() => handleFilterChange({ filterType: 'all' })}
          />

          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card className="glass-card border-salon-gold/20">
                <CardContent className="p-8 text-center">
                  <DollarSign className="mx-auto mb-4 text-salon-gold opacity-50" size={48} />
                  <p className="text-salon-copper text-lg">Nenhum lançamento encontrado</p>
                  <p className="text-sm text-muted-foreground">
                    Os lançamentos aparecerão aqui automaticamente conforme as vendas e serviços forem realizados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id} className="glass-card border-salon-gold/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-full ${entry.tipo === 'entrada' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {entry.tipo === 'entrada' ? 
                              <TrendingUp className="text-green-400" size={16} /> : 
                              <TrendingDown className="text-red-400" size={16} />
                            }
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{entry.descricao}</h3>
                            <p className="text-sm text-salon-copper">
                              {format(new Date(entry.data), 'dd/MM/yyyy')} • {getOriginTypeLabel(entry.origem_tipo)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={getCategoryColor(entry.categoria)}>
                            {entry.categoria}
                          </Badge>
                          <span className={`text-lg font-semibold ${
                            entry.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {entry.tipo === 'entrada' ? '+' : '-'}R$ {Number(entry.valor).toFixed(2)}
                          </span>
                        </div>
                        
                        {(entry.cliente_nome || entry.profissional_nome) && (
                          <div className="mt-2 flex items-center space-x-4 text-sm text-salon-copper">
                            {entry.cliente_nome && <span>Cliente: {entry.cliente_nome}</span>}
                            {entry.profissional_nome && <span>Profissional: {entry.profissional_nome}</span>}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => showDetails(entry)}
                        className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentsTab
            appointments={appointments}
            onUpdateCollectionStatus={updateAppointmentCollectionStatus}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="collections">
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="p-8 text-center">
              <CreditCard className="mx-auto mb-4 text-salon-gold opacity-50" size={48} />
              <p className="text-salon-copper text-lg">Sistema de Cobranças</p>
              <p className="text-sm text-muted-foreground">
                Em breve: sistema automatizado de cobrança para clientes em débito.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">Detalhes do Lançamento</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-salon-copper">Tipo</p>
                  <p className="text-white capitalize">{selectedEntry.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-salon-copper">Data</p>
                  <p className="text-white">{format(new Date(selectedEntry.data), 'dd/MM/yyyy')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-salon-copper">Categoria</p>
                <p className="text-white">{selectedEntry.categoria}</p>
              </div>
              
              <div>
                <p className="text-sm text-salon-copper">Descrição</p>
                <p className="text-white">{selectedEntry.descricao}</p>
              </div>
              
              <div>
                <p className="text-sm text-salon-copper">Valor</p>
                <p className={`text-lg font-semibold ${
                  selectedEntry.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'
                }`}>
                  R$ {Number(selectedEntry.valor).toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-salon-copper">Origem</p>
                <p className="text-white">{getOriginTypeLabel(selectedEntry.origem_tipo)}</p>
              </div>
              
              {selectedEntry.cliente_nome && (
                <div>
                  <p className="text-sm text-salon-copper">Cliente</p>
                  <p className="text-white">{selectedEntry.cliente_nome}</p>
                </div>
              )}
              
              {selectedEntry.profissional_nome && (
                <div>
                  <p className="text-sm text-salon-copper">Profissional</p>
                  <p className="text-white">{selectedEntry.profissional_nome}</p>
                </div>
              )}
              
              {isAdmin && (
                <div className="pt-4 border-t border-salon-gold/20">
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="mr-2" size={16} />
                        Apagar Lançamento
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border-salon-gold/30 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-salon-gold">Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="text-salon-copper">
                          Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteEntry(selectedEntry.id)}
                          disabled={deletingEntry}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {deletingEntry ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashFlowManagement;
