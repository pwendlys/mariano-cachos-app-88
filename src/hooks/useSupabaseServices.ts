
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseService {
  id: string;
  nome: string;
  categoria: 'corte' | 'coloracao' | 'tratamento' | 'finalizacao' | 'outros';
  preco: number;
  duracao: number;
  ativo: boolean;
  created_at?: string;
}

export const useSupabaseServices = () => {
  const [services, setServices] = useState<SupabaseService[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      console.log('Fetching services from Supabase...');
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Services fetched:', data);
      setServices((data || []) as SupabaseService[]);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erro ao carregar serviços",
        description: error.message || "Não foi possível carregar a lista de serviços.",
        variant: "destructive",
      });
    }
  };

  const addService = async (serviceData: Omit<SupabaseService, 'id' | 'created_at'>): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Creating service:', serviceData);
      
      const { error } = await supabase
        .from('servicos')
        .insert([serviceData]);

      if (error) {
        console.error('Error creating service:', error);
        throw error;
      }

      console.log('Service created successfully');
      await fetchServices();
      
      toast({
        title: "Serviço criado!",
        description: "Novo serviço foi adicionado com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Erro ao criar serviço",
        description: error.message || "Não foi possível criar o serviço.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (serviceId: string, serviceData: Partial<SupabaseService>): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Updating service:', serviceId, serviceData);
      
      const { error } = await supabase
        .from('servicos')
        .update(serviceData)
        .eq('id', serviceId);

      if (error) {
        console.error('Error updating service:', error);
        throw error;
      }

      console.log('Service updated successfully');
      await fetchServices();
      
      toast({
        title: "Serviço atualizado!",
        description: "As informações do serviço foram atualizadas.",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Erro ao atualizar serviço",
        description: error.message || "Não foi possível atualizar o serviço.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Deleting service:', serviceId);
      
      // Soft delete - marca como inativo ao invés de excluir
      const { error } = await supabase
        .from('servicos')
        .update({ ativo: false })
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        throw error;
      }

      console.log('Service deleted successfully');
      await fetchServices();
      
      toast({
        title: "Serviço removido",
        description: "O serviço foi desativado do sistema.",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro ao remover serviço",
        description: error.message || "Não foi possível remover o serviço.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useSupabaseServices hook initialized, fetching services...');
    fetchServices();
  }, []);

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    fetchServices,
  };
};
