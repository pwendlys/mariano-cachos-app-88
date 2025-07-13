
import React, { useState } from 'react';
import { Calendar, Clock, User, DollarSign, Eye, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, getStatusBadge, getPaymentStatusBadge } from '@/lib/appointmentUtils';

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

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  onDateTimeUpdate: (appointmentId: string, newDate: string, newTime: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onStatusChange, 
  onDateTimeUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(appointment.data);
  const [editTime, setEditTime] = useState(appointment.horario);

  const handleSaveDateTime = () => {
    if (editDate && editTime) {
      onDateTimeUpdate(appointment.id, editDate, editTime);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDate(appointment.data);
    setEditTime(appointment.horario);
    setIsEditing(false);
  };

  return (
    <Card className="glass-card border-salon-gold/20">
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
            <StatusBadge status={appointment.status} getStatusBadge={getStatusBadge} />
            <StatusBadge status={appointment.status_pagamento} getStatusBadge={getPaymentStatusBadge} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-salon-gold" />
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="glass-card border-salon-gold/30 bg-transparent text-white text-sm h-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-salon-copper" />
                  <Input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="glass-card border-salon-gold/30 bg-transparent text-white text-sm h-8"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={handleSaveDateTime}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
                  >
                    <Save size={12} />
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-7 px-3 text-xs"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <Calendar size={16} />
                  <span>{formatDate(appointment.data)}</span>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-salon-gold hover:bg-salon-gold/10 ml-2"
                  >
                    <Edit size={12} />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock size={16} />
                  <span>{appointment.horario}</span>
                </div>
              </div>
            )}
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
              onClick={() => onStatusChange(appointment.id, 'pendente')}
              variant={appointment.status === 'pendente' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              Aguardando
            </Button>
            <Button
              onClick={() => onStatusChange(appointment.id, 'confirmado')}
              variant={appointment.status === 'confirmado' ? 'default' : 'outline'}
              size="sm"
              className="text-xs bg-green-600 hover:bg-green-700 text-white"
            >
              Confirmado
            </Button>
            <Button
              onClick={() => onStatusChange(appointment.id, 'concluido')}
              variant={appointment.status === 'concluido' ? 'default' : 'outline'}
              size="sm"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Concluído
            </Button>
            <Button
              onClick={() => onStatusChange(appointment.id, 'rejeitado')}
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
  );
};

export default AppointmentCard;
