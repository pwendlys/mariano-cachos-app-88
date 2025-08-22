
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseService {
  id: string;
  nome: string;
  duracao: number;
  preco: number;
  categoria: string; // Changed from union type to string to allow flexible categories
  ativo: boolean;
  detalhes?: string | null;
  created_at?: string;
}

export const useSupabaseServices = () => {
  const [services, setServices] = useState<SupabaseService[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar serviços:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<SupabaseService, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('servicos')
        .insert([serviceData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso!",
      });

      await fetchServices();
      return true;
    } catch (error: any) {
      console.error('Erro ao criar serviço:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o serviço",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id: string, serviceData: Partial<SupabaseService>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('servicos')
        .update(serviceData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso!",
      });

      await fetchServices();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o serviço",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso!",
      });

      await fetchServices();
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir serviço:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o serviço",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};
