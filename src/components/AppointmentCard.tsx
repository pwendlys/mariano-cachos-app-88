
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Phone, MapPin, DollarSign, FileText, UserCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReviewButton } from './ReviewButton';

interface AppointmentCardProps {
  appointment: {
    id: string;
    data: string;
    horario: string;
    valor: number;
    status: string;
    status_pagamento: string;
    observacoes?: string;
    profissional_id?: string;
    cliente: {
      nome: string;
      email: string;
      telefone: string;
    };
    servico: {
      nome: string;
      categoria: string;
    };
    profissional?: {
      nome: string;
      email: string;
    };
  };
  professionals?: Array<{ id: string; nome: string; email: string }>;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  onProfessionalChange?: (appointmentId: string, professionalId: string) => void;
  onDateTimeUpdate: (appointmentId: string, newDate: string, newTime: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  professionals = [],
  onStatusChange,
  onProfessionalChange,
  onDateTimeUpdate
}) => {
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
  const [newDate, setNewDate] = useState(appointment.data);
  const [newTime, setNewTime] = useState(appointment.horario);

  const handleDateTimeSubmit = () => {
    onDateTimeUpdate(appointment.id, newDate, newTime);
    setIsEditingDateTime(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  // Check if review is available (appointment is completed)
  const canReview = appointment.status === 'concluido';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            <Badge variant={appointment.status_pagamento === 'pago' ? 'default' : 'secondary'}>
              {appointment.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {canReview && (
              <ReviewButton
                agendamentoId={appointment.id}
                clienteId={appointment.cliente.email} // Using email as client identifier
                serviceName={appointment.servico.nome}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{appointment.cliente.nome}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.cliente.telefone}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.servico.nome}</span>
              <Badge variant="outline" className="text-xs">
                {appointment.servico.categoria}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(appointment.data), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              <Dialog open={isEditingDateTime} onOpenChange={setIsEditingDateTime}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    Alterar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Alterar Data e Horário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsEditingDateTime(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleDateTimeSubmit}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.horario}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatCurrency(appointment.valor)}</span>
            </div>
          </div>
        </div>

        {appointment.profissional && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span>Profissional: {appointment.profissional.nome}</span>
          </div>
        )}

        {appointment.observacoes && (
          <div className="flex items-start gap-2 text-sm mb-4">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{appointment.observacoes}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Select
            value={appointment.status}
            onValueChange={(value) => onStatusChange(appointment.id, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>

          {professionals.length > 0 && onProfessionalChange && (
            <Select
              value={appointment.profissional_id || ""}
              onValueChange={(value) => onProfessionalChange(appointment.id, value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Atribuir profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
