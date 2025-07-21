
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, User, TrendingUp, Calendar, CheckCircle, Clock, X } from 'lucide-react';
import { useSupabaseCommissions } from '@/hooks/useSupabaseCommissions';
import { useSupabaseProfessionals } from '@/hooks/useSupabaseProfessionals';
import { format } from 'date-fns';

const CommissionManagement = () => {
  const { commissions, loading, fetchCommissions, updateCommissionStatus } = useSupabaseCommissions();
  const { professionals } = useSupabaseProfessionals();
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchCommissions({
      profissional_id: selectedProfessional || undefined,
      status: selectedStatus || undefined,
      tipo_origem: selectedType || undefined,
      data_inicio: dateRange.startDate || undefined,
      data_fim: dateRange.endDate || undefined
    });
  }, [selectedProfessional, selectedStatus, selectedType, dateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calculada':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'paga':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelada':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calculada':
        return <Clock size={14} />;
      case 'paga':
        return <CheckCircle size={14} />;
      case 'cancelada':
        return <X size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agendamento':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'venda':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleStatusChange = async (commissionId: string, newStatus: 'calculada' | 'paga' | 'cancelada') => {
    await updateCommissionStatus(commissionId, newStatus);
  };

  const getTotalCommissions = () => {
    return commissions.reduce((total, commission) => total + Number(commission.valor_comissao), 0);
  };

  const getPendingCommissions = () => {
    return commissions
      .filter(c => c.status === 'calculada')
      .reduce((total, commission) => total + Number(commission.valor_comissao), 0);
  };

  const getPaidCommissions = () => {
    return commissions
      .filter(c => c.status === 'paga')
      .reduce((total, commission) => total + Number(commission.valor_comissao), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando comissões...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-salon-copper">Total Comissões</p>
                <p className="text-2xl font-bold text-salon-gold">
                  R$ {getTotalCommissions().toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-salon-gold" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {getPendingCommissions().toFixed(2)}
                </p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Pagas</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {getPaidCommissions().toFixed(2)}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Profissional</label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="glass-card border-salon-gold/30">
                  <SelectItem value="">Todos</SelectItem>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="glass-card border-salon-gold/30">
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="calculada">Calculada</SelectItem>
                  <SelectItem value="paga">Paga</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Tipo</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="glass-card border-salon-gold/30">
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="agendamento">Agendamento</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Data Início</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="glass-card border-salon-gold/30 bg-transparent text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions List */}
      <div className="space-y-4">
        {commissions.length === 0 ? (
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="p-8 text-center">
              <TrendingUp className="mx-auto mb-4 text-salon-gold opacity-50" size={48} />
              <p className="text-salon-copper text-lg">Nenhuma comissão encontrada</p>
              <p className="text-sm text-muted-foreground">
                As comissões aparecerão aqui quando os serviços forem concluídos ou vendas finalizadas.
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
                      <div className="flex items-center space-x-1">
                        <User size={16} className="text-salon-gold" />
                        <span className="font-medium text-white">
                          {commission.profissional.nome}
                        </span>
                      </div>
                      <Badge className={getTypeColor(commission.tipo_origem)}>
                        {commission.tipo_origem === 'agendamento' ? 'Serviço' : 'Produto'}
                      </Badge>
                      <Badge className={getStatusColor(commission.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(commission.status)}
                          <span className="capitalize">{commission.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-salon-copper">Data</p>
                        <p className="text-white">
                          {format(new Date(commission.data_referencia), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-salon-copper">Valor Base</p>
                        <p className="text-white">R$ {Number(commission.valor_base).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-salon-copper">Percentual</p>
                        <p className="text-white">{commission.percentual_comissao}%</p>
                      </div>
                      <div>
                        <p className="text-salon-copper">Comissão</p>
                        <p className="text-salon-gold font-medium">
                          R$ {Number(commission.valor_comissao).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {commission.observacoes && (
                      <div className="mt-3 p-2 bg-salon-gold/10 rounded text-sm">
                        <p className="text-salon-copper">Observações:</p>
                        <p className="text-white">{commission.observacoes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {commission.status === 'calculada' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(commission.id, 'paga')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Marcar como Paga
                      </Button>
                    )}
                    {commission.status === 'calculada' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(commission.id, 'cancelada')}
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        Cancelar
                      </Button>
                    )}
                    {commission.status === 'paga' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(commission.id, 'calculada')}
                        className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                      >
                        Marcar Pendente
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommissionManagement;
