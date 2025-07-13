import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  data: string;
  horario: string;
  valor: number;
  status: string;
  status_pagamento: string;
  chave_pix: string;
  comprovante_pix: string;
  observacoes?: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  servico: {
    nome: string;
    categoria: string;
  };
}

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          servico:servicos(nome, categoria)
        `)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      const statusLabels = {
        pendente: 'aguardando',
        confirmado: 'confirmado',
        concluido: 'concluído',
        rejeitado: 'rejeitado'
      };

      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${statusLabels[newStatus as keyof typeof statusLabels]}`,
      });
      
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do agendamento",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pendente: { label: 'Aguardando', variant: 'secondary' as const },
      confirmado: { label: 'Confirmado', variant: 'default' as const },
      concluido: { label: 'Concluído', variant: 'outline' as const },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pendente;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      pago: { label: 'Pago', variant: 'default' as const },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pendente;
  };

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
            <Card key={appointment.id} className="glass-card border-salon-gold/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-salon-gold flex items-center gap-2">
                      <User size={18} />
                      {appointment.cliente.nome}
                    </CardTitle>
                    <p className="text-sm text-salon-copper mt-1">
                      {appointment.cliente.email} • {appointment.cliente.telefone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge {...getStatusBadge(appointment.status)}>
                      {getStatusBadge(appointment.status).label}
                    </Badge>
                    <Badge {...getPaymentStatusBadge(appointment.status_pagamento)}>
                      {getPaymentStatusBadge(appointment.status_pagamento).label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white">
                      <Calendar size={16} />
                      <span>{formatDate(appointment.data)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Clock size={16} />
                      <span>{appointment.horario}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-white">
                      <strong>Serviço:</strong> {appointment.servico.nome}
                    </div>
                    <div className="flex items-center gap-2 text-salon-gold">
                      <DollarSign size={16} />
                      <span className="font-bold">R$ {appointment.valor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {appointment.chave_pix && (
                  <div className="border-t border-salon-gold/20 pt-4">
                    <h4 className="text-white font-medium mb-2">Informações do Pagamento</h4>
                    <p className="text-sm text-salon-copper">
                      <strong>Chave PIX:</strong> {appointment.chave_pix}
                    </p>
                    {appointment.comprovante_pix && (
                      <p className="text-sm text-salon-copper mt-1">
                        <strong>Comprovante:</strong> Enviado
                      </p>
                    )}
                  </div>
                )}

                {appointment.observacoes && (
                  <div className="border-t border-salon-gold/20 pt-4">
                    <h4 className="text-white font-medium mb-2">Observações</h4>
                    <p className="text-sm text-salon-copper">{appointment.observacoes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-salon-gold/20">
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      onClick={() => handleStatusChange(appointment.id, 'pendente')}
                      variant={appointment.status === 'pendente' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                    >
                      Aguardando
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(appointment.id, 'confirmado')}
                      variant={appointment.status === 'confirmado' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs bg-green-600 hover:bg-green-700 text-white"
                    >
                      Confirmado
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(appointment.id, 'concluido')}
                      variant={appointment.status === 'concluido' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Concluído
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(appointment.id, 'rejeitado')}
                      variant={appointment.status === 'rejeitado' ? 'destructive' : 'outline'}
                      size="sm"
                      className="text-xs"
                    >
                      Rejeitar
                    </Button>
                  </div>
                  {appointment.comprovante_pix && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10">
                          <Eye size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Comprovante de Pagamento</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Comprovante enviado pelo cliente
                          </p>
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm">Arquivo: {appointment.comprovante_pix}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;