
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfessionalServiceLink {
  id: string;
  profissional_id: string;
  servico_id: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseProfessionalServices = () => {
  const [links, setLinks] = useState<ProfessionalServiceLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profissional_servicos')
        .select('*');

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Erro ao buscar vínculos profissional-serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os vínculos dos serviços",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getServicesForProfessional = (professionalId: string): string[] => {
    return links
      .filter(link => link.profissional_id === professionalId)
      .map(link => link.servico_id);
  };

  const linkService = async (professionalId: string, serviceId: string) => {
    try {
      const { error } = await supabase
        .from('profissional_servicos')
        .insert({
          profissional_id: professionalId,
          servico_id: serviceId
        });

      if (error) throw error;

      toast({
        title: "Serviço vinculado!",
        description: "O serviço foi vinculado ao profissional com sucesso.",
      });

      await fetchLinks();
    } catch (error) {
      console.error('Erro ao vincular serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o serviço",
        variant: "destructive",
      });
    }
  };

  const unlinkService = async (professionalId: string, serviceId: string) => {
    try {
      const { error } = await supabase
        .from('profissional_servicos')
        .delete()
        .eq('profissional_id', professionalId)
        .eq('servico_id', serviceId);

      if (error) throw error;

      toast({
        title: "Serviço desvinculado",
        description: "O serviço foi desvinculado do profissional.",
      });

      await fetchLinks();
    } catch (error) {
      console.error('Erro ao desvincular serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desvincular o serviço",
        variant: "destructive",
      });
    }
  };

  const isServiceLinked = (professionalId: string, serviceId: string): boolean => {
    return links.some(link => 
      link.profissional_id === professionalId && link.servico_id === serviceId
    );
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('professional-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profissional_servicos'
        },
        (payload) => {
          console.log('Professional services real-time update:', payload);
          fetchLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchLinks();
  }, []);

  return {
    links,
    loading,
    fetchLinks,
    getServicesForProfessional,
    linkService,
    unlinkService,
    isServiceLinked
  };
};
