import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppointmentCard from '@/components/AppointmentCard';
import { useAppointments } from '@/hooks/useAppointments';

const AppointmentManagement: React.FC = () => {
  const { appointments, loading, fetchAppointments, handleStatusChange } = useAppointments();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-salon-gold">Gerenciar Agendamentos</h2>
        <Button
          onClick={fetchAppointments}
          variant="outline"
          className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
        >
          Atualizar
        </Button>
      </div>

      {appointments.length === 0 ? (
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="pt-6">
            <div className="text-center text-salon-copper">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;