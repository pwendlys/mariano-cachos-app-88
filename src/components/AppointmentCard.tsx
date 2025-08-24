
import React, { useState } from 'react';
import { Clock, User, Calendar, Edit2, Save, X, CheckCircle, XCircle, AlertCircle, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AppointmentValueEditor from './AppointmentValueEditor';
import ClientAvatar from './ClientAvatar';

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
    avatar_url?: string;
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
  onValueUpdate: (appointmentId: string, newValue: number) => Promise<boolean>;
  onDelete: (appointmentId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  professionals,
  onStatusChange,
  onDateTimeUpdate,
  onProfessionalAssignment,
  onValueUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(appointment.data);
  const [editTime, setEditTime] = useState(appointment.horario);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const { toast } = useToast();
  
  const [selectedProfessional, setSelectedProfessional] = useState(() => {
    const profId = appointment.profissional_id;
    return (!profId || profId.trim() === '') ? 'none' : profId;
  });

  const handleSaveDateTime = async () => {
    if (editDate && editTime) {
      console.log(`Saving datetime for appointment ${appointment.id}: ${editDate} ${editTime}`);
      await onDateTimeUpdate(appointment.id, editDate, editTime);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDate(appointment.data);
    setEditTime(appointment.horario);
    setIsEditing(false);
  };

  const handleProfessionalChange = (professionalId: string) => {
    console.log('Professional change:', professionalId);
    setSelectedProfessional(professionalId);
    onProfessionalAssignment(appointment.id, professionalId === 'none' ? '' : professionalId);
  };

  const handleStatusChange = (newStatus: string) => {
    console.log(`Status change for appointment ${appointment.id}: ${newStatus}`);
    onStatusChange(appointment.id, newStatus);
  };

  const handleValueSave = async (newValue: number) => {
    console.log(`Value update for appointment ${appointment.id}: ${newValue}`);
    return await onValueUpdate(appointment.id, newValue);
  };

  const handleDelete = () => {
    onDelete(appointment.id);
  };

  const handleRequestPayment = async () => {
    setRequestingPayment(true);
    
    try {
      const currentDate = new Date().toLocaleDateString('pt-BR');
      const newObservations = appointment.observacoes 
        ? `${appointment.observacoes}\n\n[SINAL SOLICITADO em ${currentDate}]`
        : `[SINAL SOLICITADO em ${currentDate}]`;

      // Update appointment to request payment
      const { error } = await supabase
        .from('agendamentos')
        .update({
          status_pagamento: 'pendente',
          status_cobranca: 'solicitado',
          observacoes: newObservations
        })
        .eq('id', appointment.id);

      if (error) {
        throw error;
      }

      // Try to create a notification for the user (optional - won't fail if user not found)
      try {
        // First, get user_id from usuarios table using client email
        const { data: userData } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', appointment.cliente.email)
          .single();

        if (userData?.id) {
          await supabase
            .from('notificacoes')
            .insert({
              user_id: userData.id,
              tipo: 'sinal_solicitado',
              titulo: 'Sinal Solicitado 💳',
              mensagem: `O sinal foi solicitado para seu agendamento de ${appointment.servico.nome} em ${formatDate(appointment.data)} às ${formatTime(appointment.horario)}. Envie o comprovante pelo WhatsApp do salão.`,
              metadata: {
                agendamento_id: appointment.id,
                servico_nome: appointment.servico.nome,
                data: appointment.data,
                horario: appointment.horario
              }
            });
        }
      } catch (notificationError) {
        // Notification error is not critical, just log it
        console.log('Could not create notification:', notificationError);
      }

      toast({
        title: "Sinal solicitado!",
        description: "O cliente foi notificado sobre a solicitação do sinal e pode enviar o comprovante via WhatsApp.",
      });

      // Refresh the page data (the parent component should handle this via real-time updates)
      
    } catch (error: any) {
      console.error('Error requesting payment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar o sinal. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setRequestingPayment(false);
    }
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
    return timeString.slice(0, 5);
  };

  const canEdit = appointment.status !== 'concluido';
  const canEditDateTime = canEdit;
  const canRequestPayment = appointment.status === 'confirmado' && appointment.status_pagamento !== 'pago';

  return (
    <Card className="glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {appointment.servico.nome}
                </h3>
                <p className="text-salon-copper text-sm">{appointment.servico.categoria}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(appointment.status)}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-2 capitalize">{appointment.status}</span>
                </Badge>
                <AppointmentValueEditor
                  currentValue={appointment.valor}
                  onSave={handleValueSave}
                  status={appointment.status}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <ClientAvatar
                  avatar_url={appointment.cliente.avatar_url}
                  nome={appointment.cliente.nome}
                  size="sm"
                />
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

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-salon-gold" size={16} />
                <div className="flex-1">
                  {appointment.profissional ? (
                    <div>
                      <p className="text-white font-medium">{appointment.profissional.nome}</p>
                      <p className="text-salon-copper text-sm">{appointment.profissional.email}</p>
                    </div>
                  ) : (
                    <p className="text-salon-copper">Nenhum profissional atribuído</p>
                  )}
                </div>
              </div>
              
              {canEdit && (
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
              )}
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

          <div className="flex flex-col gap-2 lg:w-48">
            {!isEditing ? (
              <>
                {canEditDateTime && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                  >
                    <Edit2 size={16} className="mr-2" />
                    Editar Data/Hora
                  </Button>
                )}
                
                <Select value={appointment.status} onValueChange={handleStatusChange}>
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

                {canRequestPayment && (
                  <Button
                    onClick={handleRequestPayment}
                    disabled={requestingPayment}
                    variant="outline"
                    size="sm"
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                  >
                    <CreditCard size={16} className="mr-2" />
                    {requestingPayment ? 'Solicitando...' : 'Cobrar Sinal'}
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-salon-dark border-salon-gold/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription className="text-salon-copper">
                        Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
