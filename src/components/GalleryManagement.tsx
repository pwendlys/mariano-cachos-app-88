
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Edit, Eye, X, Plus, Image as ImageIcon } from 'lucide-react';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { useGalleryPhotos, type GalleryPhoto } from '@/hooks/useGalleryPhotos';

const GalleryManagement = () => {
  const { photos, loading, fetchPhotos, addPhoto, updatePhoto, deletePhoto } = useGalleryPhotos();
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    display_order: 0
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Apenas arquivos de imagem são permitidos.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !editingPhoto) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingPhoto?.image_url || '';

      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (!uploadedUrl) {
          throw new Error('Erro no upload da imagem');
        }
        imageUrl = uploadedUrl;
      }

      const photoData = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        is_active: formData.is_active,
        display_order: formData.display_order
      };

      if (editingPhoto) {
        await updatePhoto(editingPhoto.id, photoData);
        toast({
          title: "Sucesso",
          description: "Imagem atualizada com sucesso!"
        });
      } else {
        await addPhoto(photoData);
        toast({
          title: "Sucesso",
          description: "Imagem adicionada com sucesso!"
        });
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar imagem",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || '',
      is_active: photo.is_active,
      display_order: photo.display_order
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    const success = await deletePhoto(id);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Imagem excluída com sucesso!"
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const success = await updatePhoto(id, { is_active: !currentStatus });
    if (success) {
      toast({
        title: "Sucesso",
        description: `Imagem ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      is_active: true,
      display_order: 0
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingPhoto(null);
    setShowAddDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-gold"></div>
      </div>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={['admin', 'convidado']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-salon-gold">Gerenciar Galeria</h2>
            <p className="text-muted-foreground">Adicione e gerencie as imagens da galeria</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Imagem
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-salon-gold">
                  {editingPhoto ? 'Editar Imagem' : 'Adicionar Nova Imagem'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Ordem de Exibição</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="is_active">Ativo</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem">
                    {editingPhoto ? 'Nova Imagem (opcional)' : 'Imagem *'}
                  </Label>
                  <Input
                    id="imagem"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    required={!editingPhoto}
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  {editingPhoto && !previewUrl && (
                    <div className="mt-2">
                      <img
                        src={editingPhoto.image_url}
                        alt="Atual"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={uploading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
                  >
                    {uploading ? 'Salvando...' : editingPhoto ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="glass-card border-salon-gold/20">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Badge variant={photo.is_active ? "default" : "secondary"}>
                      {photo.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-salon-gold">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {photo.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Ordem: {photo.display_order}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-salon-gold/20">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(photo)}
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(photo.id, photo.is_active)}
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(photo.id)}
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {photos.length === 0 && (
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-salon-gold mb-2">
                Nenhuma imagem encontrada
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Adicione a primeira imagem à sua galeria
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Imagem
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default GalleryManagement;
