
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAppointmentActions = () => {
  const { toast } = useToast();

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (error) {
        console.error('Status update error:', error);
        throw error;
      }

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
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do agendamento",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleProfessionalAssignment = async (appointmentId: string, professionalId: string) => {
    try {
      console.log(`Assigning professional ${professionalId} to appointment ${appointmentId}`);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          profissional_id: professionalId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Professional assignment error:', error);
        throw error;
      }

      toast({
        title: "Profissional atribuído",
        description: professionalId 
          ? "O profissional foi atribuído ao agendamento com sucesso"
          : "O profissional foi removido do agendamento",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atribuir profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o profissional",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDateTimeUpdate = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      console.log(`Updating appointment ${appointmentId} datetime to: ${newDate} ${newTime}`);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          data: newDate,
          horario: newTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('DateTime update error:', error);
        throw error;
      }

      toast({
        title: "Agendamento atualizado",
        description: `Data e horário alterados com sucesso`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar data/horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a data e horário do agendamento",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleValueUpdate = async (appointmentId: string, newValue: number) => {
    try {
      console.log(`Updating appointment ${appointmentId} value to: ${newValue}`);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          valor: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Value update error:', error);
        throw error;
      }

      toast({
        title: "Valor atualizado",
        description: `Valor do agendamento atualizado para R$ ${newValue.toFixed(2)}`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o valor do agendamento",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleStatusChange,
    handleProfessionalAssignment,
    handleDateTimeUpdate,
    handleValueUpdate
  };
};
