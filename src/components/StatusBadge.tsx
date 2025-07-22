
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pendente: { label: 'Pendente', variant: 'secondary' as const },
    confirmado: { label: 'Confirmado', variant: 'default' as const },
    concluido: { label: 'Concluído', variant: 'outline' as const },
    rejeitado: { label: 'Rejeitado', variant: 'destructive' as const }
  };
  
  return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusInfo = getStatusBadge(status);
  
  return (
    <Badge variant={statusInfo.variant}>
      {statusInfo.label}
    </Badge>
  );
};

export default StatusBadge;
