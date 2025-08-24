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

interface GalleryImage {
  id: string;
  titulo: string;
  descricao?: string;
  url_imagem: string;
  categoria: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
}

const GalleryManagement = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'cortes',
    ativo: true,
    ordem: 0
  });

  const categories = [
    { value: 'cortes', label: 'Cortes' },
    { value: 'coloracao', label: 'Coloração' },
    { value: 'tratamentos', label: 'Tratamentos' },
    { value: 'penteados', label: 'Penteados' },
    { value: 'outros', label: 'Outros' }
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('galeria')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar imagens da galeria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
      const filePath = `galeria/${fileName}`;

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
    
    if (!selectedFile && !editingImage) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingImage?.url_imagem || '';

      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (!uploadedUrl) {
          throw new Error('Erro no upload da imagem');
        }
        imageUrl = uploadedUrl;
      }

      const imageData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        url_imagem: imageUrl,
        categoria: formData.categoria,
        ativo: formData.ativo,
        ordem: formData.ordem
      };

      if (editingImage) {
        const { error } = await supabase
          .from('galeria')
          .update(imageData)
          .eq('id', editingImage.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Imagem atualizada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('galeria')
          .insert([imageData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Imagem adicionada com sucesso!"
        });
      }

      resetForm();
      fetchImages();
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

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      titulo: image.titulo,
      descricao: image.descricao || '',
      categoria: image.categoria,
      ativo: image.ativo,
      ordem: image.ordem
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      const { error } = await supabase
        .from('galeria')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Imagem excluída com sucesso!"
      });

      fetchImages();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir imagem",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('galeria')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Imagem ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`
      });

      fetchImages();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da imagem",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      categoria: 'cortes',
      ativo: true,
      ordem: 0
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingImage(null);
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
                  {editingImage ? 'Editar Imagem' : 'Adicionar Nova Imagem'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <select
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ordem">Ordem de Exibição</Label>
                    <Input
                      id="ordem"
                      type="number"
                      value={formData.ordem}
                      onChange={(e) => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ativo"
                        checked={formData.ativo}
                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="ativo">Ativo</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem">
                    {editingImage ? 'Nova Imagem (opcional)' : 'Imagem *'}
                  </Label>
                  <Input
                    id="imagem"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    required={!editingImage}
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
                  {editingImage && !previewUrl && (
                    <div className="mt-2">
                      <img
                        src={editingImage.url_imagem}
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
                    {uploading ? 'Salvando...' : editingImage ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="glass-card border-salon-gold/20">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={image.url_imagem}
                    alt={image.titulo}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Badge variant={image.ativo ? "default" : "secondary"}>
                      {image.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-salon-gold">{image.titulo}</h3>
                  {image.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {image.descricao}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="capitalize">{image.categoria}</span>
                    <span>Ordem: {image.ordem}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-salon-gold/20">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(image)}
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(image.id, image.ativo)}
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(image.id)}
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
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
