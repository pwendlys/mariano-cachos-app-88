
import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseCashFlow, CashFlowFilters } from '@/hooks/useSupabaseCashFlow';
import CashFlowFilters from '@/components/CashFlowFilters';
import { format } from 'date-fns';

const CashFlowManagement = () => {
  const { entries, loading, fetchEntries, addEntry } = useSupabaseCashFlow();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CashFlowFilters>({
    filterType: 'all'
  });
  
  const [formData, setFormData] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    categoria: '',
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    cliente_nome: '',
    profissional_nome: '',
    observacoes: ''
  });

  const handleFilterChange = (newFilters: CashFlowFilters) => {
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

    try {
      await addEntry({
        tipo: formData.tipo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: formData.valor,
        data: formData.data,
        cliente_nome: formData.cliente_nome || null,
        profissional_nome: formData.profissional_nome || null,
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
        cliente_nome: '',
        profissional_nome: '',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando fluxo de caixa...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Fluxo de Caixa</h2>
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
                  <Input
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                    placeholder="Nome do cliente"
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Profissional</label>
                  <Input
                    value={formData.profissional_nome}
                    onChange={(e) => setFormData({...formData, profissional_nome: e.target.value})}
                    placeholder="Nome do profissional"
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
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

      {/* Statistics Cards */}
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

      {/* Filters */}
      <CashFlowFilters
        startDate={filters.startDate}
        endDate={filters.endDate}
        onStartDateChange={(date) => handleFilterChange({...filters, startDate: date})}
        onEndDateChange={(date) => handleFilterChange({...filters, endDate: date})}
        filterType={filters.filterType}
        onFilterTypeChange={(type) => handleFilterChange({...filters, filterType: type})}
        onClearFilters={() => handleFilterChange({ filterType: 'all' })}
      />

      {/* Entries List */}
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

      {/* Details Dialog */}
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
              
              {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-salon-copper">Informações Adicionais</p>
                  <div className="bg-salon-gold/10 p-3 rounded text-sm">
                    <pre className="text-white whitespace-pre-wrap">
                      {JSON.stringify(selectedEntry.metadata, null, 2)}
                    </pre>
                  </div>
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
