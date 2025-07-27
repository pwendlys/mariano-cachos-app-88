
import React, { useState } from 'react';
import { Clock, User, Calendar, Edit2, Save, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Professional {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidades: string[];
  avatar?: string;
  ativo: boolean;
  percentual_comissao_padrao: number;
}

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
  professionals: Professional[];
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  onDateTimeUpdate: (appointmentId: string, newDate: string, newTime: string) => void;
  onProfessionalAssignment: (appointmentId: string, professionalId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  professionals,
  onStatusChange,
  onDateTimeUpdate,
  onProfessionalAssignment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(appointment.data);
  const [editTime, setEditTime] = useState(appointment.horario);
  const [selectedProfessional, setSelectedProfessional] = useState(appointment.profissional_id || 'none');

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
    // Convert 'none' back to empty string for the backend
    onProfessionalAssignment(appointment.id, professionalId === 'none' ? '' : professionalId);
  };

  const activeProfessionals = professionals.filter(prof => prof.ativo);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'concluido':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejeitado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'concluido':
        return <CheckCircle size={16} className="text-blue-400" />;
      case 'rejeitado':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <AlertCircle size={16} className="text-yellow-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove seconds if present
  };

  return (
    <Card className="glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {appointment.servico.nome}
                </h3>
                <p className="text-salon-copper text-sm">{appointment.servico.categoria}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(appointment.status)}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-2 capitalize">{appointment.status}</span>
                </Badge>
                <span className="text-lg font-bold text-salon-gold">
                  R$ {appointment.valor.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <User className="text-salon-gold" size={16} />
                <div>
                  <p className="text-white font-medium">{appointment.cliente.nome}</p>
                  <p className="text-salon-copper text-sm">{appointment.cliente.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <>
                    <Calendar className="text-salon-gold" size={16} />
                    <div>
                      <p className="text-white font-medium">
                        {formatDate(appointment.data)} às {formatTime(appointment.horario)}
                      </p>
                      <p className="text-salon-copper text-sm">Data e horário</p>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                    <Input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="glass-card border-salon-gold/30 bg-transparent text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Professional Assignment */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <User className="text-salon-gold" size={16} />
                <div className="flex-1">
                  {appointment.profissional ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{appointment.profissional.nome}</p>
                        <p className="text-salon-copper text-sm">{appointment.profissional.email}</p>
                      </div>
                      <Button
                        onClick={() => setSelectedProfessional('none')}
                        variant="ghost"
                        size="sm"
                        className="text-salon-gold hover:bg-salon-gold/10"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-salon-copper">Nenhum profissional atribuído</p>
                  )}
                </div>
              </div>
              
              <div className="mt-2">
                <Select value={selectedProfessional} onValueChange={handleProfessionalChange}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue placeholder="Selecionar profissional" />
                  </SelectTrigger>
                  <SelectContent className="bg-salon-dark border-salon-gold/30">
                    <SelectItem value="none">Nenhum profissional</SelectItem>
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

            {appointment.observacoes && (
              <div className="mb-4">
                <p className="text-sm text-salon-copper mb-1">Observações:</p>
                <p className="text-white text-sm bg-salon-dark/50 p-2 rounded">
                  {appointment.observacoes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 lg:w-48">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  <Edit2 size={16} className="mr-2" />
                  Editar Data/Hora
                </Button>
                
                <Select value={appointment.status} onValueChange={(value) => onStatusChange(appointment.id, value)}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-salon-dark border-salon-gold/30">
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveDateTime}
                  size="sm"
                  className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium"
                >
                  <Save size={16} />
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
