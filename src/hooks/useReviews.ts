
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  agendamento_id: string;
  cliente_id: string;
  nota: number;
  comentario?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  exibir_no_perfil: boolean;
  created_at: string;
  cliente?: {
    nome: string;
    email: string;
  };
  agendamento?: {
    data: string;
    horario: string;
    servico: {
      nome: string;
    };
  };
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          cliente:clientes(nome, email),
          agendamento:agendamentos(
            data, 
            horario,
            servico:servicos(nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as avaliações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (agendamentoId: string, clienteId: string, nota: number, comentario?: string) => {
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .insert({
          agendamento_id: agendamentoId,
          cliente_id: clienteId,
          nota,
          comentario,
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi enviada para análise. Obrigado pelo feedback!",
      });

      fetchReviews();
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a avaliação",
        variant: "destructive",
      });
    }
  };

  const updateReviewStatus = async (reviewId: string, status: 'aprovada' | 'rejeitada') => {
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Avaliação ${status === 'aprovada' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });

      fetchReviews();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da avaliação",
        variant: "destructive",
      });
    }
  };

  const toggleDisplayOnProfile = async (reviewId: string, exibirNoPerfil: boolean) => {
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({ exibir_no_perfil: exibirNoPerfil })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Atualizado",
        description: `Avaliação ${exibirNoPerfil ? 'será exibida' : 'não será exibida'} no perfil`,
      });

      fetchReviews();
    } catch (error) {
      console.error('Erro ao atualizar exibição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração de exibição",
        variant: "destructive",
      });
    }
  };

  const getPublicReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          cliente:clientes(nome)
        `)
        .eq('status', 'aprovada')
        .eq('exibir_no_perfil', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar avaliações públicas:', error);
      return [];
    }
  };

  const getAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('nota')
        .eq('status', 'aprovada');

      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const sum = data.reduce((acc, review) => acc + review.nota, 0);
      return sum / data.length;
    } catch (error) {
      console.error('Erro ao calcular média:', error);
      return 0;
    }
  };

  const getTotalClients = async () => {
    try {
      const { count, error } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar clientes:', error);
      return 0;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return {
    reviews,
    loading,
    createReview,
    updateReviewStatus,
    toggleDisplayOnProfile,
    getPublicReviews,
    getAverageRating,
    getTotalClients,
    fetchReviews
  };
};
