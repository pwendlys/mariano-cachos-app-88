
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppointmentCard } from '@/components/AppointmentCard';
import AppointmentDateFilter from '@/components/AppointmentDateFilter';
import { useAppointments } from '@/hooks/useAppointments';

export const AppointmentManagement: React.FC = () => {
  const { 
    appointments, 
    loading, 
    selectedDate,
    selectedStatus,
    fetchAppointments, 
    handleDateChange,
    handleStatusFilter,
    handleStatusChange, 
    handleDateTimeUpdate 
  } = useAppointments();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando agendamentos...</div>
      </div>
    );
  }

  const getAppointmentStats = () => {
    const stats = {
      pending: appointments.filter(apt => apt.status === 'pendente').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmado').length,
      completed: appointments.filter(apt => apt.status === 'concluido').length,
      rejected: appointments.filter(apt => apt.status === 'rejeitado').length,
    };
    return stats;
  };

  const stats = getAppointmentStats();

  // Filter appointments based on selected status
  const filteredAppointments = selectedStatus 
    ? appointments.filter(apt => apt.status === selectedStatus)
    : appointments;

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Pendentes',
      confirmado: 'Confirmados',
      concluido: 'Concluídos',
      rejeitado: 'Rejeitados'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-salon-gold">Gerenciar Agendamentos</h2>
        <div className="flex items-center gap-3">
          <AppointmentDateFilter
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
          <Button
            onClick={() => fetchAppointments(selectedDate)}
            variant="outline"
            className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Now Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`glass-card border-yellow-500/20 cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedStatus === 'pendente' ? 'ring-2 ring-yellow-500 bg-yellow-500/20' : 'hover:bg-yellow-500/10'
          }`}
          onClick={() => handleStatusFilter('pendente')}
        >
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-sm text-yellow-500/80">Pendentes</div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`glass-card border-green-500/20 cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedStatus === 'confirmado' ? 'ring-2 ring-green-500 bg-green-500/20' : 'hover:bg-green-500/10'
          }`}
          onClick={() => handleStatusFilter('confirmado')}
        >
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.confirmed}</div>
              <div className="text-sm text-green-500/80">Confirmados</div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`glass-card border-blue-500/20 cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedStatus === 'concluido' ? 'ring-2 ring-blue-500 bg-blue-500/20' : 'hover:bg-blue-500/10'
          }`}
          onClick={() => handleStatusFilter('concluido')}
        >
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.completed}</div>
              <div className="text-sm text-blue-500/80">Concluídos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`glass-card border-red-500/20 cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedStatus === 'rejeitado' ? 'ring-2 ring-red-500 bg-red-500/20' : 'hover:bg-red-500/10'
          }`}
          onClick={() => handleStatusFilter('rejeitado')}
        >
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
              <div className="text-sm text-red-500/80">Rejeitados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Status Indicator */}
      {selectedStatus && (
        <div className="flex items-center justify-between bg-salon-gold/10 p-3 rounded-lg border border-salon-gold/20">
          <div className="text-salon-gold">
            Mostrando apenas agendamentos: <strong>{getStatusLabel(selectedStatus)}</strong>
          </div>
          <Button
            onClick={() => handleStatusFilter(null)}
            variant="outline"
            size="sm"
            className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
          >
            Mostrar Todos
          </Button>
        </div>
      )}

      {filteredAppointments.length === 0 ? (
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="pt-6">
            <div className="text-center text-salon-copper">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">
                {selectedStatus 
                  ? `Nenhum agendamento ${getStatusLabel(selectedStatus).toLowerCase()} encontrado`
                  : selectedDate 
                    ? `Nenhum agendamento encontrado para ${selectedDate.toLocaleDateString('pt-BR')}`
                    : 'Nenhum agendamento encontrado'
                }
              </p>
              <p className="text-sm opacity-75">
                {selectedStatus 
                  ? 'Tente selecionar outro status ou clique em "Mostrar Todos"'
                  : 'Os novos agendamentos aparecerão aqui automaticamente.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              {filteredAppointments.length} agendamento{filteredAppointments.length > 1 ? 's' : ''} 
              {selectedStatus && ` ${getStatusLabel(selectedStatus).toLowerCase()}`}
              {selectedDate && ` para ${selectedDate.toLocaleDateString('pt-BR')}`}
            </h3>
          </div>
          
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={handleStatusChange}
                onDateTimeUpdate={handleDateTimeUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
