import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  getStatusBadge: (status: string) => { label: string; variant: 'secondary' | 'default' | 'outline' | 'destructive' };
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, getStatusBadge }) => {
  const statusInfo = getStatusBadge(status);
  
  return (
    <Badge variant={statusInfo.variant}>
      {statusInfo.label}
    </Badge>
  );
};

export default StatusBadge;