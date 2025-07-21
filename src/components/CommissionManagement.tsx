
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseCommissions } from '@/hooks/useSupabaseCommissions';
import { useProfessionals } from '@/hooks/useProfessionals';
import { format } from 'date-fns';
import SelectDebugger from './SelectDebugger';

const CommissionManagement = () => {
  const { commissions, loading, fetchCommissions, addCommission, updateCommission, deleteCommission } = useSupabaseCommissions();
  const { professionals, getActiveProfessionals } = useProfessionals();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    profissional_id: '',
    tipo_origem: 'manual' as 'manual' | 'agendamento' | 'venda',
    valor_base: 0,
    percentual_comissao: 0,
    data_referencia: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  const handleAddCommission = async () => {
    if (!formData.profissional_id || formData.valor_base <= 0 || formData.percentual_comissao <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const valorComissao = (formData.valor_base * formData.percentual_comissao) / 100;
      
      await addCommission({
        profissional_id: formData.profissional_id,
        tipo_origem: formData.tipo_origem,
        valor_base: formData.valor_base,
        percentual_comissao: formData.percentual_comissao,
        valor_comissao: valorComissao,
        data_referencia: formData.data_referencia,
        observacoes: formData.observacoes
      });
      
      setIsAddDialogOpen(false);
      setFormData({
        profissional_id: '',
        tipo_origem: 'manual',
        valor_base: 0,
        percentual_comissao: 0,
        data_referencia: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
      
      fetchCommissions();
    } catch (error) {
      // Error handled in hook
    }
  };

  const showDetails = (commission: any) => {
    setSelectedCommission(commission);
    setIsDetailsDialogOpen(true);
  };

  const getProfessionalName = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    return professional?.nome || 'Profissional não encontrado';
  };

  const getOriginTypeLabel = (tipo_origem: string) => {
    const labels = {
      'manual': 'Manual',
      'agendamento': 'Agendamento',
      'venda': 'Venda'
    };
    return labels[tipo_origem as keyof typeof labels] || tipo_origem;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'calculada': 'bg-green-500/20 text-green-400 border-green-500/30',
      'paga': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'cancelada': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || colors['calculada'];
  };

  const getTotalCommissions = () => {
    return commissions.reduce((sum, commission) => sum + Number(commission.valor_comissao), 0);
  };

  const getTotalCommissionsThisMonth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return commissions
      .filter(c => {
        const commissionDate = new Date(c.data_referencia);
        return commissionDate.getMonth() === currentMonth && commissionDate.getFullYear() === currentYear;
      })
      .reduce((sum, commission) => sum + Number(commission.valor_comissao), 0);
  };

  const activeProfessionals = getActiveProfessionals();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando comissões...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Comissões</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium">
              <Plus className="mr-2" size={16} />
              Nova Comissão
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">Nova Comissão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Profissional *</label>
                <Select value={formData.profissional_id} onValueChange={(value) => setFormData({...formData, profissional_id: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    {activeProfessionals.map((professional) => (
                      <SelectDebugger key={professional.id} value={professional.id}>
                        {professional.nome}
                      </SelectDebugger>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Origem *</label>
                <Select value={formData.tipo_origem} onValueChange={(value: 'manual' | 'agendamento' | 'venda') => setFormData({...formData, tipo_origem: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30">
                    <SelectDebugger value="manual">Manual</SelectDebugger>
                    <SelectDebugger value="agendamento">Agendamento</SelectDebugger>
                    <SelectDebugger value="venda">Venda</SelectDebugger>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Valor Base *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_base}
                    onChange={(e) => setFormData({...formData, valor_base: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Percentual (%) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.percentual_comissao}
                    onChange={(e) => setFormData({...formData, percentual_comissao: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="glass-card border-salon-gold/30 bg-transparent text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data de Referência *</label>
                <Input
                  type="date"
                  value={formData.data_referencia}
                  onChange={(e) => setFormData({...formData, data_referencia: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <Input
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações sobre a comissão"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div className="bg-salon-gold/10 p-3 rounded text-sm">
                <p className="text-salon-gold">
                  Valor da Comissão: R$ {((formData.valor_base * formData.percentual_comissao) / 100).toFixed(2)}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleAddCommission}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium"
                >
                  Adicionar Comissão
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-salon-copper">Total Comissões</p>
                <p className="text-2xl font-bold text-salon-gold">
                  R$ {getTotalCommissions().toFixed(2)}
                </p>
              </div>
              <Calculator className="text-salon-gold" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-salon-copper">Este Mês</p>
                <p className="text-2xl font-bold text-salon-gold">
                  R$ {getTotalCommissionsThisMonth().toFixed(2)}
                </p>
              </div>
              <TrendingUp className="text-salon-gold" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      <div className="space-y-4">
        {commissions.length === 0 ? (
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="p-8 text-center">
              <Calculator className="mx-auto mb-4 text-salon-gold opacity-50" size={48} />
              <p className="text-salon-copper text-lg">Nenhuma comissão encontrada</p>
              <p className="text-sm text-muted-foreground">
                As comissões aparecerão aqui automaticamente conforme os serviços forem realizados.
              </p>
            </CardContent>
          </Card>
        ) : (
          commissions.map((commission) => (
            <Card key={commission.id} className="glass-card border-salon-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-full bg-salon-gold/20">
                        <DollarSign className="text-salon-gold" size={16} />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{getProfessionalName(commission.profissional_id)}</h3>
                        <p className="text-sm text-salon-copper">
                          {format(new Date(commission.data_referencia), 'dd/MM/yyyy')} • {getOriginTypeLabel(commission.tipo_origem)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(commission.status)}>
                        {commission.status}
                      </Badge>
                      <span className="text-lg font-semibold text-salon-gold">
                        R$ {Number(commission.valor_comissao).toFixed(2)}
                      </span>
                      <span className="text-sm text-salon-copper">
                        ({commission.percentual_comissao}% de R$ {Number(commission.valor_base).toFixed(2)})
                      </span>
                    </div>
                    
                    {commission.observacoes && (
                      <p className="mt-2 text-sm text-salon-copper">
                        {commission.observacoes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => showDetails(commission)}
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      <Edit2 size={16} />
                    </Button>
                  </div>
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
            <DialogTitle className="text-salon-gold">Detalhes da Comissão</DialogTitle>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-salon-copper">Profissional</p>
                <p className="text-white">{getProfessionalName(selectedCommission.profissional_id)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-salon-copper">Tipo de Origem</p>
                  <p className="text-white">{getOriginTypeLabel(selectedCommission.tipo_origem)}</p>
                </div>
                <div>
                  <p className="text-sm text-salon-copper">Status</p>
                  <Badge className={getStatusColor(selectedCommission.status)}>
                    {selectedCommission.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-salon-copper">Data de Referência</p>
                <p className="text-white">{format(new Date(selectedCommission.data_referencia), 'dd/MM/yyyy')}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-salon-copper">Valor Base</p>
                  <p className="text-white">R$ {Number(selectedCommission.valor_base).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-salon-copper">Percentual</p>
                  <p className="text-white">{selectedCommission.percentual_comissao}%</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-salon-copper">Valor da Comissão</p>
                <p className="text-lg font-semibold text-salon-gold">
                  R$ {Number(selectedCommission.valor_comissao).toFixed(2)}
                </p>
              </div>
              
              {selectedCommission.observacoes && (
                <div>
                  <p className="text-sm text-salon-copper">Observações</p>
                  <p className="text-white">{selectedCommission.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommissionManagement;
