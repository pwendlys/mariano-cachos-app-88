import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAppointmentActions = () => {
  const { toast } = useToast();

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);
      
      // Para agendamentos sendo marcados como concluído, garantir que têm valor
      if (newStatus === 'concluido') {
        // Primeiro buscar o agendamento atual para verificar se tem valor
        const { data: currentAppointment, error: fetchError } = await supabase
          .from('agendamentos')
          .select('*, servicos(preco)')
          .eq('id', appointmentId)
          .single();

        if (fetchError) {
          console.error('Error fetching appointment:', fetchError);
          throw fetchError;
        }

        // Se não tem valor, usar o preço do serviço
        let updateData: any = { 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        };

        if (!currentAppointment.valor && currentAppointment.servicos?.preco) {
          updateData.valor = currentAppointment.servicos.preco;
          console.log(`Setting appointment value to service price: ${currentAppointment.servicos.preco}`);
        }

        const { error } = await supabase
          .from('agendamentos')
          .update(updateData)
          .eq('id', appointmentId);

        if (error) {
          console.error('Status update error:', error);
          throw error;
        }
      } else {
        // Para outros status, atualização normal
        const { error } = await supabase
          .from('agendamentos')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', appointmentId);

        if (error) {
          console.error('Status update error:', error);
          throw error;
        }
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

  const deleteAppointment = async (appointmentId: string) => {
    try {
      console.log(`Deleting appointment ${appointmentId}`);
      
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        console.error('Delete appointment error:', error);
        throw error;
      }

      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi removido com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleStatusChange,
    handleProfessionalAssignment,
    handleDateTimeUpdate,
    handleValueUpdate,
    deleteAppointment
  };
};
