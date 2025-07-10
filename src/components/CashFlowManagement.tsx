import React, { useState, useEffect, useMemo } from 'react';
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
import CashFlowFilters from './CashFlowFilters';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CashFlowEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  client?: string;
  professional?: string;
  professionalId?: string;
  debtId?: string; // Link para dívidas
}

interface CashFlowManagementProps {
  entries?: CashFlowEntry[];
  setEntries?: (entries: CashFlowEntry[]) => void;
}

const CashFlowManagement: React.FC<CashFlowManagementProps> = ({ entries: externalEntries, setEntries: setExternalEntries }) => {
  const { toast } = useToast();
  const { services } = useSharedServices();
  const { products } = useSharedProducts();
  const { professionals, getProfessionalById } = useProfessionals();
  const { dividas, getTotals } = useDebtCollection();
  
  const [internalEntries, setInternalEntries] = useState<CashFlowEntry[]>([
    {
      id: '1',
      date: '2024-06-15',
      type: 'income',
      category: 'Serviço',
      description: 'Corte + Hidratação',
      amount: 150,
      client: 'Maria Santos',
      professional: 'Marcos',
      professionalId: '1'
    },
    {
      id: '2',
      date: '2024-06-15',
      type: 'expense',
      category: 'Alimentação',
      description: 'Almoço da equipe',
      amount: 45
    },
    {
      id: '3',
      date: '2024-06-15',
      type: 'expense',
      category: 'Utilidades',
      description: 'Conta de luz',
      amount: 120
    },
    {
      id: '4',
      date: '2024-06-14',
      type: 'income',
      category: 'Serviço',
      description: 'Coloração',
      amount: 200,
      client: 'Ana Silva',
      professional: 'Carla'
    },
    {
      id: '5',
      date: '2024-06-13',
      type: 'expense',
      category: 'Produtos',
      description: 'Shampoo e condicionador',
      amount: 80
    }
  ]);

  // Usar entradas externas se fornecidas, senão usar internas
  const entries = externalEntries || internalEntries;
  const setEntries = setExternalEntries || setInternalEntries;

  // Estados para filtros
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    description: '',
    amount: '',
    client: '',
    professional: '',
    professionalId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [importType, setImportType] = useState<'manual' | 'service' | 'product' | 'debt'>('manual');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedDebtId, setSelectedDebtId] = useState<string>('');

  const incomeCategories = ['Serviço', 'Produto', 'Cobrança', 'Outros'];
  const expenseCategories = ['Alimentação', 'Utilidades', 'Produtos', 'Transporte', 'Manutenção', 'Comissões', 'Outros'];

  // Função para criar lançamento de comissão automaticamente
  const createCommissionEntry = (serviceEntry: CashFlowEntry, professionalId: string, serviceAmount: number) => {
    const professional = getProfessionalById(professionalId);
    if (!professional || !professional.commissionPercentage) return null;

    const commissionAmount = (serviceAmount * professional.commissionPercentage) / 100;
    
    return {
      id: `commission-${Date.now()}-${Math.random()}`,
      date: serviceEntry.date,
      type: 'expense' as const,
      category: 'Comissões',
      description: `Comissão ${professional.name} - ${serviceEntry.description}`,
      amount: commissionAmount,
      professional: professional.name,
      professionalId: professionalId
    };
  };

  // Criar lançamentos automáticos baseados nas dívidas pagas
  useEffect(() => {
    const paidDebts = dividas.filter(d => d.status === 'pago');
    const existingDebtEntries = entries.filter(e => e.debtId);
    
    paidDebts.forEach(debt => {
      const existingEntry = existingDebtEntries.find(e => e.debtId === debt.id);
      if (!existingEntry) {
        const debtEntry: CashFlowEntry = {
          id: `debt-${debt.id}`,
          date: new Date().toISOString().split('T')[0],
          type: 'income',
          category: 'Cobrança',
          description: `Cobrança recebida - ${debt.devedor?.nome}`,
          amount: debt.valor_atual,
          client: debt.devedor?.nome,
          debtId: debt.id
        };
        
        setEntries([...entries, debtEntry]);
      }
    });
  }, [dividas]);

  // Filtrar entradas com base nos filtros selecionados
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filtro por tipo
      if (filterType !== 'all' && entry.type !== filterType) {
        return false;
      }

      // Filtro por data
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < startDate) {
        return false;
      }
      if (endDate && entryDate > endDate) {
        return false;
      }

      return true;
    });
  }, [entries, filterType, startDate, endDate]);

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
    setSelectedDebtId('');
    setFormData({
      type: 'income',
      category: '',
      description: '',
      amount: '',
      client: '',
      professional: '',
      professionalId: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: CashFlowEntry) => {
    setEditingEntry(entry);
    setSelectedDate(new Date(entry.date));
    setImportType('manual');
    setSelectedServiceId('');
    setSelectedProductId('');
    setSelectedDebtId('');
    setFormData({
      type: entry.type,
      category: entry.category,
      description: entry.description,
      amount: entry.amount.toString(),
      client: entry.client || '',
      professional: entry.professional || '',
      professionalId: entry.professionalId || '',
      date: entry.date
    });
    setIsDialogOpen(true);
  };

  const handleImportTypeChange = (type: 'manual' | 'service' | 'product' | 'debt') => {
    setImportType(type);
    setSelectedServiceId('');
    setSelectedProductId('');
    setSelectedDebtId('');
    
    if (type === 'manual') {
      setFormData(prev => ({
        ...prev,
        type: 'income',
        category: '',
        description: '',
        amount: '',
        client: '',
        professional: '',
        professionalId: ''
      }));
    } else if (type === 'service') {
      setFormData(prev => ({
        ...prev,
        type: 'income',
        category: 'Serviço',
        description: '',
        amount: '',
        client: '',
        professional: '',
        professionalId: ''
      }));
    } else if (type === 'product') {
      setFormData(prev => ({
        ...prev,
        type: 'income',
        category: 'Produto',
        description: '',
        amount: '',
        client: ''
      }));
    } else if (type === 'debt') {
      setFormData(prev => ({
        ...prev,
        type: 'income',
        category: 'Cobrança',
        description: '',
        amount: '',
        client: ''
      }));
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData(prev => ({
        ...prev,
        description: service.name,
        amount: service.price.toString()
      }));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        description: product.name,
        amount: product.price.toString()
      }));
    }
  };

  const handleDebtSelect = (debtId: string) => {
    setSelectedDebtId(debtId);
    const debt = dividas.find(d => d.id === debtId);
    if (debt) {
      setFormData(prev => ({
        ...prev,
        description: `Cobrança - ${debt.descricao}`,
        amount: debt.valor_atual.toString(),
        client: debt.devedor?.nome || ''
      }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleProfessionalSelect = (professionalId: string) => {
    const professional = getProfessionalById(professionalId);
    setFormData(prev => ({
      ...prev,
      professionalId,
      professional: professional?.name || ''
    }));
  };

  const handleSave = () => {
    if (!formData.category || !formData.description || !formData.amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const entryData: CashFlowEntry = {
      id: editingEntry?.id || Date.now().toString(),
      date: formData.date,
      type: formData.type as 'income' | 'expense',
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      client: formData.client || undefined,
      professional: formData.professional || undefined,
      professionalId: formData.professionalId || undefined,
      debtId: selectedDebtId || undefined
    };

    let newEntries = [...entries];

    if (editingEntry) {
      newEntries = entries.map(e => e.id === editingEntry.id ? entryData : e);
      toast({
        title: "Lançamento atualizado!",
        description: "O registro foi atualizado com sucesso.",
      });
    } else {
      newEntries = [...entries, entryData];
      
      // Se for um serviço com profissional, criar automaticamente a comissão
      if (entryData.type === 'income' && 
          entryData.category === 'Serviço' && 
          entryData.professionalId) {
        const commissionEntry = createCommissionEntry(entryData, entryData.professionalId, entryData.amount);
        if (commissionEntry) {
          newEntries.push(commissionEntry);
          toast({
            title: "Lançamento e comissão adicionados!",
            description: `Serviço registrado e comissão de R$ ${commissionEntry.amount.toFixed(2)} criada automaticamente.`,
          });
        } else {
          toast({
            title: "Lançamento adicionado!",
            description: "Novo registro foi criado com sucesso.",
          });
        }
      } else {
        toast({
          title: "Lançamento adicionado!",
          description: "Novo registro foi criado com sucesso.",
        });
      }
    }

    setEntries(newEntries);
    setIsDialogOpen(false);
  };

  const handleDelete = (entryId: string) => {
    setEntries(entries.filter(e => e.id !== entryId));
    toast({
      title: "Lançamento removido",
      description: "O registro foi excluído do sistema.",
    });
  };

  // Calcular totais baseados nas entradas filtradas
  const filteredIncome = filteredEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const filteredExpenses = filteredEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const filteredBalance = filteredIncome - filteredExpenses;

  // Manter os totais do dia de hoje para os cards originais
  const todayEntries = entries.filter(entry => entry.date === new Date().toISOString().split('T')[0]);
  const todayIncome = todayEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const todayExpenses = todayEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const todayBalance = todayIncome - todayExpenses;

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
                    <SelectItem value="debt">Importar Cobrança</SelectItem>
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

              {importType === 'debt' && (
                <div>
                  <Label className="block text-sm font-medium mb-2">Selecionar Dívida</Label>
                  <Select value={selectedDebtId} onValueChange={handleDebtSelect}>
                    <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                      <SelectValue placeholder="Escolha uma dívida paga" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-salon-gold/30">
                      {dividas.filter(d => d.status === 'pago').map(debt => (
                        <SelectItem key={debt.id} value={debt.id}>
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} />
                            <span>{debt.devedor?.nome} - R$ {debt.valor_atual.toFixed(2)}</span>
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
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value, category: importType === 'service' ? 'Serviço' : importType === 'product' ? 'Produto' : importType === 'debt' ? 'Cobrança' : ''})}
                  disabled={importType !== 'manual'}
                >
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                  disabled={importType !== 'manual'}
                >
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Descrição *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Corte + Finalização"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              {formData.type === 'income' && (
                <>
                  <div>
                    <Label className="block text-sm font-medium mb-2">Cliente</Label>
                    <Input
                      value={formData.client}
                      onChange={(e) => setFormData({...formData, client: e.target.value})}
                      placeholder="Nome do cliente"
                      className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                    />
                  </div>

                  {importType !== 'debt' && (
                    <div>
                      <Label className="block text-sm font-medium mb-2">Profissional</Label>
                      <Select value={formData.professionalId} onValueChange={handleProfessionalSelect}>
                        <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-salon-gold/30">
                          {professionals.filter(p => p.isActive).map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.name} ({prof.commissionPercentage}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
            {(startDate || endDate || filterType !== 'all') ? 'Lançamentos Filtrados' : 'Lançamentos de Hoje'}
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
                  <div className={`w-2 h-12 rounded-full ${entry.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-white font-medium">{entry.description}</p>
                    <p className="text-sm text-muted-foreground">{entry.category}</p>
                    <p className="text-xs text-salon-copper">{format(new Date(entry.date), "dd/MM/yyyy")}</p>
                    {entry.client && (
                      <p className="text-xs text-salon-copper">Cliente: {entry.client}</p>
                    )}
                    {entry.professional && (
                      <p className="text-xs text-salon-gold">Por: {entry.professional}</p>
                    )}
                    {entry.debtId && (
                      <p className="text-xs text-orange-400">Cobrança Recebida</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className={`font-bold ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(entry)}
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-10 w-10"
                    disabled={!!entry.debtId} // Não permitir edição de lançamentos automáticos de cobrança
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-10 w-10"
                    disabled={!!entry.debtId} // Não permitir exclusão de lançamentos automáticos de cobrança
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
