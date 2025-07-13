export const formatDate = (date: string) => {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
};

export const getStatusBadge = (status: string) => {
  const statusMap = {
    pendente: { label: 'Aguardando', variant: 'secondary' as const },
    confirmado: { label: 'Confirmado', variant: 'default' as const },
    concluido: { label: 'Concluído', variant: 'outline' as const },
    rejeitado: { label: 'Rejeitado', variant: 'destructive' as const },
  };
  
  return statusMap[status as keyof typeof statusMap] || statusMap.pendente;
};

export const getPaymentStatusBadge = (status: string) => {
  const statusMap = {
    pendente: { label: 'Pendente', variant: 'secondary' as const },
    pago: { label: 'Pago', variant: 'default' as const },
    rejeitado: { label: 'Rejeitado', variant: 'destructive' as const },
  };
  
  return statusMap[status as keyof typeof statusMap] || statusMap.pendente;
};