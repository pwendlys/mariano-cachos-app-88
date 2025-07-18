
import React, { useState, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Edit, Trash2, CalendarIcon, Package, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useSharedServices } from '@/hooks/useSharedServices';
import { useSharedProducts } from '@/hooks/useSharedProducts';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useDebtCollection } from '@/hooks/useDebtCollection';
import { useSupabaseCashFlow, type CashFlowEntry } from '@/hooks/useSupabaseCashFlow';
import CashFlowFilters from './CashFlowFilters';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CashFlowManagement: React.FC = () => {
  const { toast } = useToast();
  const { services } = useSharedServices();
  const { products } = useSharedProducts();
  const { professionals, getProfessionalById } = useProfessionals();
  const { dividas, getTotals } = useDebtCollection();
  const { entries, loading, fetchEntries, addEntry, updateEntry, deleteEntry } = useSupabaseCashFlow();
  
  // Estados para filtros
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all');

  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    categoria: '',
    descricao: '',
    valor: '',
    cliente_nome: '',
    profissional_nome: '',
    data: new Date().toISOString().split('T')[0]
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [importType, setImportType] = useState<'manual' | 'service' | 'product'>('manual');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const incomeCategories = ['Serviços', 'Produtos', 'Cobrança', 'Outros'];
  const expenseCategories = ['Alimentação', 'Utilidades', 'Produtos', 'Transporte', 'Manutenção', 'Comissões', 'Outros'];

  // Filtrar entradas com base nos filtros selecionados
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filtro por tipo
      if (filterType !== 'all' && entry.tipo !== filterType) {
        return false;
      }

      // Filtro por data
      const entryDate = new Date(entry.data);
      if (startDate && entryDate < startDate) {
        return false;
      }
      if (endDate && entryDate > endDate) {
        return false;
      }

      return true;
    });
  }, [entries, filterType, startDate, endDate]);

  // Aplicar filtros quando mudarem
  React.useEffect(() => {
    fetchEntries({ startDate, endDate, filterType });
  }, [startDate, endDate, filterType]);

  // Limpar filtros
  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setFilterType('all');
  };

  const handleAdd = () => {
    setEditingEntry(null);
    setSelectedDate(new Date());
    setImportType('manual');
    setSelectedServiceId('');
    setSelectedProductId('');
    setFormData({
      tipo: 'entrada',
      categoria: '',
      descricao: '',
      valor: '',
      cliente_nome: '',
      profissional_nome: '',
      data: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: CashFlowEntry) => {
    // Não permitir edição de lançamentos automáticos
    if (entry.origem_tipo && entry.origem_tipo !== 'manual') {
      toast({
        title: "Lançamento automático",
        description: "Este lançamento foi criado automaticamente e não pode ser editado.",
        variant: "destructive"
      });
      return;
    }

    setEditingEntry(entry);
    setSelectedDate(new Date(entry.data));
    setImportType('manual');
    setFormData({
      tipo: entry.tipo,
      categoria: entry.categoria,
      descricao: entry.descricao,
      valor: entry.valor.toString(),
      cliente_nome: entry.cliente_nome || '',
      profissional_nome: entry.profissional_nome || '',
      data: entry.data
    });
    setIsDialogOpen(true);
  };

  const handleImportTypeChange = (type: 'manual' | 'service' | 'product') => {
    setImportType(type);
    setSelectedServiceId('');
    setSelectedProductId('');
    
    if (type === 'manual') {
      setFormData(prev => ({
        ...prev,
        tipo: 'entrada',
        categoria: '',
        descricao: '',
        valor: '',
        cliente_nome: '',
        profissional_nome: ''
      }));
    } else if (type === 'service') {
      setFormData(prev => ({
        ...prev,
        tipo: 'entrada',
        categoria: 'Serviços',
        descricao: '',
        valor: '',
        cliente_nome: '',
        profissional_nome: ''
      }));
    } else if (type === 'product') {
      setFormData(prev => ({
        ...prev,
        tipo: 'entrada',
        categoria: 'Produtos',
        descricao: '',
        valor: '',
        cliente_nome: ''
      }));
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData(prev => ({
        ...prev,
        descricao: service.name,
        valor: service.price.toString()
      }));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        descricao: product.name,
        valor: product.price.toString()
      }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        data: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.categoria || !formData.descricao || !formData.valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const entryData = {
      data: formData.data,
      tipo: formData.tipo as 'entrada' | 'saida',
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      cliente_nome: formData.cliente_nome || null,
      profissional_nome: formData.profissional_nome || null,
      origem_tipo: 'manual',
      origem_id: null,
      metadata: {}
    };

    if (editingEntry) {
      const result = await updateEntry(editingEntry.id, entryData);
      if (result) {
        setIsDialogOpen(false);
      }
    } else {
      const result = await addEntry(entryData);
      if (result) {
        setIsDialogOpen(false);
      }
    }
  };

  const handleDelete = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    
    // Não permitir exclusão de lançamentos automáticos
    if (entry?.origem_tipo && entry.origem_tipo !== 'manual') {
      toast({
        title: "Lançamento automático",
        description: "Este lançamento foi criado automaticamente e não pode ser excluído.",
        variant: "destructive"
      });
      return;
    }

    await deleteEntry(entryId);
  };

  // Calcular totais baseados nas entradas filtradas
  const filteredIncome = filteredEntries.filter(e => e.tipo === 'entrada').reduce((sum, e) => sum + Number(e.valor), 0);
  const filteredExpenses = filteredEntries.filter(e => e.tipo === 'saida').reduce((sum, e) => sum + Number(e.valor), 0);
  const filteredBalance = filteredIncome - filteredExpenses;

  // Manter os totais do dia de hoje para os cards originais
  const todayEntries = entries.filter(entry => entry.data === new Date().toISOString().split('T')[0]);
  const todayIncome = todayEntries.filter(e => e.tipo === 'entrada').reduce((sum, e) => sum + Number(e.valor), 0);
  const todayExpenses = todayEntries.filter(e => e.tipo === 'saida').reduce((sum, e) => sum + Number(e.valor), 0);
  const todayBalance = todayIncome - todayExpenses;

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAdd}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12 px-6"
            >
              <Plus className="mr-2" size={16} />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">
                {editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal glass-card border-salon-gold/30 bg-transparent text-white h-12",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-card border-salon-gold/30" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Origem dos Dados</Label>
                <Select value={importType} onValueChange={handleImportTypeChange}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="service">Importar Serviço</SelectItem>
                    <SelectItem value="product">Importar Produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {importType === 'service' && (
                <div>
                  <Label className="block text-sm font-medium mb-2">Selecionar Serviço</Label>
                  <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                      <SelectValue placeholder="Escolha um serviço" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center gap-2">
                            <Scissors size={16} />
                            <span>{service.name} - R$ {service.price.toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {importType === 'product' && (
                <div>
                  <Label className="block text-sm font-medium mb-2">Selecionar Produto</Label>
                  <Select value={selectedProductId} onValueChange={handleProductSelect}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                      <SelectValue placeholder="Escolha um produto" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <Package size={16} />
                            <span>{product.name} - R$ {product.price.toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="block text-sm font-medium mb-2">Tipo *</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value) => setFormData({...formData, tipo: value, categoria: importType === 'service' ? 'Serviços' : importType === 'product' ? 'Produtos' : ''})}
                  disabled={importType !== 'manual'}
                >
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    <SelectItem value="entrada">Receita</SelectItem>
                    <SelectItem value="saida">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Categoria *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                  disabled={importType !== 'manual'}
                >
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    {(formData.tipo === 'entrada' ? incomeCategories : expenseCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Descrição *</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Ex: Corte + Finalização"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  placeholder="0.00"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              {formData.tipo === 'entrada' && (
                <>
                  <div>
                    <Label className="block text-sm font-medium mb-2">Cliente</Label>
                    <Input
                      value={formData.cliente_nome}
                      onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                      placeholder="Nome do cliente"
                      className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-2">Profissional</Label>
                    <Input
                      value={formData.profissional_nome}
                      onChange={(e) => setFormData({...formData, profissional_nome: e.target.value})}
                      placeholder="Nome do profissional"
                      className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                    />
                  </div>
                </>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
                >
                  {editingEntry ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <CashFlowFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        onClearFilters={handleClearFilters}
      />

      {/* Resumo do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2 text-sm">
              <TrendingUp size={16} />
              Receitas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {todayIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 flex items-center gap-2 text-sm">
              <TrendingDown size={16} />
              Despesas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {todayExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className={`glass-card ${todayBalance >= 0 ? 'border-salon-gold/20' : 'border-red-500/20'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 text-sm ${todayBalance >= 0 ? 'text-salon-gold' : 'text-red-400'}`}>
              <DollarSign size={16} />
              Saldo Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayBalance >= 0 ? 'text-salon-gold' : 'text-red-400'}`}>
              R$ {todayBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Cobranças */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-400 flex items-center gap-2 text-sm">
              <DollarSign size={16} />
              Em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {getTotals.totalEmAberto.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2 text-sm">
              <DollarSign size={16} />
              Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {getTotals.totalRecebido.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center gap-2 text-sm">
              <DollarSign size={16} />
              Parcelado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {getTotals.totalParcelado.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo dos Filtros */}
      {(startDate || endDate || filterType !== 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-400 flex items-center gap-2 text-sm">
                <TrendingUp size={16} />
                Receitas (Filtradas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {filteredIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-400 flex items-center gap-2 text-sm">
                <TrendingDown size={16} />
                Despesas (Filtradas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {filteredExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className={`glass-card ${filteredBalance >= 0 ? 'border-salon-gold/20' : 'border-red-500/20'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-sm ${filteredBalance >= 0 ? 'text-salon-gold' : 'text-red-400'}`}>
                <DollarSign size={16} />
                Saldo (Filtrado)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${filteredBalance >= 0 ? 'text-salon-gold' : 'text-red-400'}`}>
                R$ {filteredBalance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Lançamentos */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Calendar size={20} />
            {(startDate || endDate || filterType !== 'all') ? 'Lançamentos Filtrados' : 'Lançamentos Recentes'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredEntries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum lançamento encontrado com os filtros aplicados
            </p>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-12 rounded-full ${entry.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-white font-medium">{entry.descricao}</p>
                    <p className="text-sm text-muted-foreground">{entry.categoria}</p>
                    <p className="text-xs text-salon-copper">{format(new Date(entry.data), "dd/MM/yyyy")}</p>
                    {entry.cliente_nome && (
                      <p className="text-xs text-salon-copper">Cliente: {entry.cliente_nome}</p>
                    )}
                    {entry.profissional_nome && (
                      <p className="text-xs text-salon-gold">Por: {entry.profissional_nome}</p>
                    )}
                    {entry.origem_tipo && entry.origem_tipo !== 'manual' && (
                      <p className="text-xs text-blue-400">Automático ({entry.origem_tipo})</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className={`font-bold ${entry.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.tipo === 'entrada' ? '+' : '-'} R$ {Number(entry.valor).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(entry)}
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-10 w-10"
                    disabled={entry.origem_tipo !== 'manual' && entry.origem_tipo != null}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-10 w-10"
                    disabled={entry.origem_tipo !== 'manual' && entry.origem_tipo != null}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowManagement;
