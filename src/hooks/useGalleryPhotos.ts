
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useGalleryPhotos = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async (activeOnly = false) => {
    try {
      let query = supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar fotos da galeria:', error);
        toast.error('Erro ao carregar fotos da galeria');
        return;
      }

      setPhotos(data || []);
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async (photoData: Omit<GalleryPhoto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .insert([photoData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar foto:', error);
        toast.error('Erro ao adicionar foto');
        return null;
      }

      setPhotos(prev => [...prev, data]);
      toast.success('Foto adicionada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      toast.error('Erro ao adicionar foto');
      return null;
    }
  };

  const updatePhoto = async (id: string, updates: Partial<GalleryPhoto>) => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar foto:', error);
        toast.error('Erro ao atualizar foto');
        return null;
      }

      setPhotos(prev => prev.map(photo => photo.id === id ? data : photo));
      toast.success('Foto atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error('Erro ao atualizar foto');
      return null;
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar foto:', error);
        toast.error('Erro ao deletar foto');
        return false;
      }

      setPhotos(prev => prev.filter(photo => photo.id !== id));
      toast.success('Foto removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      toast.error('Erro ao deletar foto');
      return false;
    }
  };

  const reorderPhotos = async (newOrder: GalleryPhoto[]) => {
    try {
      const updates = newOrder.map((photo, index) => ({
        id: photo.id,
        display_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('gallery_photos')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      setPhotos(newOrder);
      toast.success('Ordem das fotos atualizada!');
    } catch (error) {
      console.error('Erro ao reordenar fotos:', error);
      toast.error('Erro ao reordenar fotos');
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return {
    photos,
    loading,
    fetchPhotos,
    addPhoto,
    updatePhoto,
    deletePhoto,
    reorderPhotos
  };
};
