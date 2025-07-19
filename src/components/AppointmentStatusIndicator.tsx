
import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppointmentStatusIndicatorProps {
  status: 'livre' | 'ocupado' | 'pendente';
  time: string;
  appointmentInfo?: {
    clientName?: string;
    serviceName?: string;
  };
}

const AppointmentStatusIndicator: React.FC<AppointmentStatusIndicatorProps> = ({
  status,
  time,
  appointmentInfo
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'livre':
        return {
          icon: Clock,
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          label: 'Disponível'
        };
      case 'ocupado':
        return {
          icon: CheckCircle,
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          label: 'Ocupado'
        };
      case 'pendente':
        return {
          icon: AlertCircle,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          label: 'Aguardando Aprovação'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          label: 'Indefinido'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className={`${config.color} flex items-center space-x-1 px-2 py-1`}>
        <Icon size={12} />
        <span className="text-xs font-medium">{time}</span>
      </Badge>
      
      {appointmentInfo && status !== 'livre' && (
        <div className="text-xs text-muted-foreground">
          {appointmentInfo.clientName && (
            <div>{appointmentInfo.clientName}</div>
          )}
          {appointmentInfo.serviceName && (
            <div className="text-salon-copper">{appointmentInfo.serviceName}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusIndicator;
