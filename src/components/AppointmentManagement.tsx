
import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppointmentCard from './AppointmentCard';
import { useAppointments } from '@/hooks/useAppointments';
import { useSupabaseProfessionals } from '@/hooks/useSupabaseProfessionals';

const AppointmentManagement = () => {
  const {
    appointments,
    loading,
    selectedDate,
    selectedStatus,
    handleDateChange,
    handleStatusFilter,
    handleStatusChange,
    handleProfessionalAssignment,
    handleDateTimeUpdate
  } = useAppointments();

  const { professionals } = useSupabaseProfessionals();

  const [showFilters, setShowFilters] = useState(false);

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedStatus && appointment.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const getStatusCount = (status: string) => {
    return appointments.filter(app => app.status === status).length;
  };

  const formatFilterDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateFilterChange = (dateString: string) => {
    if (dateString) {
      handleDateChange(new Date(dateString));
    } else {
      handleDateChange(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salon-gold mx-auto"></div>
          <p className="text-muted-foreground mt-2">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-salon-gold">Gerenciar Agendamentos</h2>
          <p className="text-muted-foreground">
            {filteredAppointments.length} agendamento{filteredAppointments.length !== 1 ? 's' : ''} encontrado{filteredAppointments.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
          >
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{getStatusCount('pendente')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Calendar size={16} className="text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Confirmados</p>
                <p className="text-2xl font-bold text-green-400">{getStatusCount('confirmado')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Calendar size={16} className="text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400">Concluídos</p>
                <p className="text-2xl font-bold text-blue-400">{getStatusCount('concluido')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar size={16} className="text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Rejeitados</p>
                <p className="text-2xl font-bold text-red-400">{getStatusCount('rejeitado')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <Calendar size={16} className="text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-salon-gold text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Data</label>
                <Input
                  type="date"
                  value={formatFilterDate(selectedDate)}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Status</label>
                <Select value={selectedStatus || ''} onValueChange={(value) => handleStatusFilter(value || null)}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-salon-dark border-salon-gold/30">
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              {(selectedDate || selectedStatus) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDateChange(null);
                    handleStatusFilter(null);
                  }}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  <X size={16} className="mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {(selectedDate || selectedStatus) && (
        <div className="flex flex-wrap gap-2">
          {selectedDate && (
            <Badge variant="secondary" className="bg-salon-gold/20 text-salon-gold">
              Data: {selectedDate.toLocaleDateString('pt-BR')}
              <button
                onClick={() => handleDateChange(null)}
                className="ml-2 hover:text-salon-copper"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          {selectedStatus && (
            <Badge variant="secondary" className="bg-salon-gold/20 text-salon-gold">
              Status: {selectedStatus}
              <button
                onClick={() => handleStatusFilter(null)}
                className="ml-2 hover:text-salon-copper"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="p-8 text-center">
              <Calendar size={48} className="text-salon-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-muted-foreground">
                {selectedDate || selectedStatus 
                  ? 'Tente ajustar os filtros para encontrar agendamentos'
                  : 'Não há agendamentos registrados no momento'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              professionals={professionals}
              onStatusChange={handleStatusChange}
              onDateTimeUpdate={handleDateTimeUpdate}
              onProfessionalAssignment={handleProfessionalAssignment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;
