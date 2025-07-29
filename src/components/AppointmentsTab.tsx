
import React from 'react';
import { Calendar, Clock, User, CreditCard, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AppointmentWithDetails } from '@/hooks/useSupabaseCashFlow';

interface AppointmentsTabProps {
  appointments: AppointmentWithDetails[];
  onUpdateCollectionStatus: (appointmentId: string, status: 'pendente' | 'cobrado' | 'pago') => Promise<boolean>;
  loading: boolean;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  onUpdateCollectionStatus,
  loading
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle },
      'cobrado': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
      'pago': { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAppointmentStatusBadge = (status: string) => {
    const statusConfig = {
      'confirmado': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      'concluido': { color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmado;
    
    return (
      <Badge className={config.color}>
        {status === 'confirmado' ? 'Confirmado' : 'Concluído'}
      </Badge>
    );
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'pendente' | 'cobrado' | 'pago') => {
    await onUpdateCollectionStatus(appointmentId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando atendimentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <Card className="glass-card border-salon-gold/20">
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto mb-4 text-salon-gold opacity-50" size={48} />
            <p className="text-salon-copper text-lg">Nenhum atendimento encontrado</p>
            <p className="text-sm text-muted-foreground">
              Os atendimentos confirmados e concluídos aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        appointments.map((appointment) => (
          <Card key={appointment.id} className="glass-card border-salon-gold/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-salon-gold" size={16} />
                      <span className="text-white font-medium">
                        {format(new Date(appointment.data), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-salon-gold" size={16} />
                      <span className="text-white">{appointment.horario}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="text-salon-copper" size={16} />
                      <span className="text-white">
                        {appointment.cliente?.nome || 'Cliente não identificado'}
                      </span>
                    </div>
                    
                    <div className="text-salon-copper">
                      Serviço: <span className="text-white">{appointment.servico?.nome}</span>
                    </div>
                    
                    {appointment.profissional && (
                      <div className="text-salon-copper">
                        Profissional: <span className="text-white">{appointment.profissional.nome}</span>
                      </div>
                    )}
                    
                    <div className="text-salon-copper">
                      Valor: <span className="text-salon-gold font-semibold">
                        R$ {(appointment.valor || appointment.servico?.preco || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {getAppointmentStatusBadge(appointment.status)}
                  {getStatusBadge(appointment.status_cobranca)}
                </div>
              </div>
              
              {/* Action buttons for collection status */}
              <div className="flex gap-2 pt-4 border-t border-salon-gold/20">
                <Button
                  onClick={() => handleStatusUpdate(appointment.id, 'pendente')}
                  disabled={appointment.status_cobranca === 'pendente'}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <AlertCircle size={14} className="mr-1" />
                  Pendente
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate(appointment.id, 'cobrado')}
                  disabled={appointment.status_cobranca === 'cobrado'}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <Clock size={14} className="mr-1" />
                  Cobrado
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate(appointment.id, 'pago')}
                  disabled={appointment.status_cobranca === 'pago'}
                  variant="outline"
                  size="sm"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle size={14} className="mr-1" />
                  Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AppointmentsTab;
