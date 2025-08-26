
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserAppointments } from '@/hooks/useUserAppointments';
import { Calendar, Clock, DollarSign, CheckCircle, AlertCircle, XCircle, Clock as ClockIcon } from 'lucide-react';

const UserAppointments = () => {
  const { 
    appointments, 
    loading, 
    getStatusLabel, 
    getStatusColor, 
    getPaymentStatusLabel, 
    formatDate 
  } = useUserAppointments();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle size={14} />;
      case 'concluido':
        return <CheckCircle size={14} />;
      case 'rejeitado':
        return <XCircle size={14} />;
      default:
        return <ClockIcon size={14} />;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-salon-gold/20">
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-salon-gold border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold flex items-center gap-2">
          <Calendar size={20} />
          Meus Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Você ainda não possui agendamentos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="glass-card border-salon-gold/10 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-salon-gold">
                      {appointment.servico.nome}
                    </h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {appointment.servico.categoria}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                    {getStatusIcon(appointment.status)}
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-salon-gold" />
                    <span>{formatDate(appointment.data)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-salon-gold" />
                    <span>{appointment.horario}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-salon-gold" />
                    <span>R$ {appointment.valor.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-salon-gold" />
                    <span>{getPaymentStatusLabel(appointment.status_pagamento)}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <span>Duração: {appointment.servico.duracao} minutos</span>
                </div>

                {appointment.observacoes && (
                  <div className="mt-3 pt-3 border-t border-salon-gold/20">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Observações:</span> {appointment.observacoes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserAppointments;
