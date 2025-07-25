
import React, { useState } from 'react';
import { Calendar, Clock, User, DollarSign, Eye, Edit, Save, X, CheckCircle, XCircle, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, getStatusBadge, getPaymentStatusBadge } from '@/lib/appointmentUtils';
import { useSupabaseProfessionals } from '@/hooks/useSupabaseProfessionals';

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
}

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  onDateTimeUpdate: (appointmentId: string, newDate: string, newTime: string) => void;
  onProfessionalAssignment: (appointmentId: string, professionalId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onStatusChange, 
  onDateTimeUpdate,
  onProfessionalAssignment 
}) => {
  const { professionals, loading: professionalsLoading } = useSupabaseProfessionals();
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(appointment.data);
  const [editTime, setEditTime] = useState(appointment.horario);
  const [selectedProfessional, setSelectedProfessional] = useState(appointment.profissional_id || '');

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

  const handleProfessionalChange = (professionalId: string) => {
    setSelectedProfessional(professionalId);
    onProfessionalAssignment(appointment.id, professionalId);
  };

  const activeProfessionals = professionals.filter(prof => prof.ativo);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejeitado':
        return <XCircle size={16} className="text-red-500" />;
      case 'concluido':
        return <CheckCircle size={16} className="text-blue-500" />;
      default:
        return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'border-green-500/50 bg-green-500/10';
      case 'rejeitado':
        return 'border-red-500/50 bg-red-500/10';
      case 'concluido':
        return 'border-blue-500/50 bg-blue-500/10';
      default:
        return 'border-yellow-500/50 bg-yellow-500/10';
    }
  };

  return (
    <Card className={`glass-card border-salon-gold/20 ${getStatusColor(appointment.status)}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-salon-gold flex items-center gap-2">
              <User size={18} />
              {appointment.cliente.nome}
              {getStatusIcon(appointment.status)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <span className="font-medium">{formatDate(appointment.data)}</span>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-salon-gold hover:bg-salon-gold/10 ml-2"
                    title="Editar data e horário"
                  >
                    <Edit size={12} />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock size={16} />
                  <span className="font-medium">{appointment.horario}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-white">
              <strong className="text-salon-gold">Serviço:</strong> {appointment.servico.nome}
            </div>
            <div className="text-white">
              <strong className="text-salon-gold">Categoria:</strong> {appointment.servico.categoria}
            </div>
            <div className="flex items-center gap-2 text-salon-gold">
              <DollarSign size={16} />
              <span className="font-bold text-lg">R$ {appointment.valor.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Professional Assignment Section */}
        <div className="border-t border-salon-gold/20 pt-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <UserPlus size={16} className="text-salon-gold" />
            Profissional Responsável
          </h4>
          <div className="space-y-2">
            {appointment.profissional ? (
              <div className="flex items-center justify-between bg-salon-gold/10 p-3 rounded-lg">
                <div>
                  <p className="text-salon-gold font-medium">{appointment.profissional.nome}</p>
                  <p className="text-salon-copper text-sm">{appointment.profissional.email}</p>
                </div>
                <Button
                  onClick={() => setSelectedProfessional('')}
                  variant="ghost"
                  size="sm"
                  className="text-salon-gold hover:bg-salon-gold/10"
                  title="Remover profissional"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="bg-salon-copper/10 p-3 rounded-lg">
                <p className="text-salon-copper text-sm">Nenhum profissional atribuído</p>
              </div>
            )}
            
            <Select 
              value={selectedProfessional} 
              onValueChange={handleProfessionalChange}
              disabled={professionalsLoading}
            >
              <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                <SelectValue placeholder="Selecionar profissional" />
              </SelectTrigger>
              <SelectContent className="bg-salon-dark border-salon-gold/30">
                <SelectItem value="">Nenhum profissional</SelectItem>
                {activeProfessionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    <div className="flex flex-col">
                      <span className="text-white">{professional.nome}</span>
                      <span className="text-salon-copper text-sm">{professional.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {appointment.chave_pix && (
          <div className="border-t border-salon-gold/20 pt-4">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-salon-gold" />
              Informações do Pagamento
            </h4>
            <div className="bg-salon-gold/10 p-3 rounded-lg space-y-1">
              <p className="text-sm text-salon-copper">
                <strong>Chave PIX:</strong> {appointment.chave_pix}
              </p>
              {appointment.comprovante_pix && (
                <p className="text-sm text-green-400">
                  <strong>✅ Comprovante:</strong> Enviado
                </p>
              )}
            </div>
          </div>
        )}

        {appointment.observacoes && (
          <div className="border-t border-salon-gold/20 pt-4">
            <h4 className="text-white font-medium mb-2">Observações do Cliente</h4>
            <div className="bg-salon-copper/10 p-3 rounded-lg">
              <p className="text-sm text-salon-copper italic">"{appointment.observacoes}"</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-salon-gold/20 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            <Button
              onClick={() => onStatusChange(appointment.id, 'pendente')}
              variant={appointment.status === 'pendente' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs ${
                appointment.status === 'pendente' 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10'
              }`}
            >
              <AlertCircle size={12} className="mr-1" />
              Pendente
            </Button>
            <Button
              onClick={() => onStatusChange(appointment.id, 'confirmado')}
              variant={appointment.status === 'confirmado' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs ${
                appointment.status === 'confirmado' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-green-400/30 text-green-400 hover:bg-green-400/10'
              }`}
            >
              <CheckCircle size={12} className="mr-1" />
              Aprovar
            </Button>
            <Button
              onClick={() => onStatusChange(appointment.id, 'concluido')}
              variant={appointment.status === 'concluido' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs ${
                appointment.status === 'concluido' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-blue-400/30 text-blue-400 hover:bg-blue-400/10'
              }`}
            >
              <CheckCircle size={12} className="mr-1" />
              Concluído
            </Button>
            <Button
              onClick={() => onStatusChange(appointment.id, 'rejeitado')}
              variant={appointment.status === 'rejeitado' ? 'destructive' : 'outline'}
              size="sm"
              className={`text-xs ${
                appointment.status === 'rejeitado' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-red-400/30 text-red-400 hover:bg-red-400/10'
              }`}
            >
              <XCircle size={12} className="mr-1" />
              Rejeitar
            </Button>
          </div>
          
          {appointment.comprovante_pix && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 text-xs"
                  title="Ver comprovante"
                >
                  <Eye size={12} className="mr-1" />
                  Comprovante
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
