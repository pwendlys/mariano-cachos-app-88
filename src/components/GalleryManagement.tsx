import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGalleryPhotos, type GalleryPhoto } from '@/hooks/useGalleryPhotos';
import { uploadToBannerBucket } from '@/lib/supabaseStorage';
import { Plus, Edit, Trash2, GripVertical, Image } from 'lucide-react';
import { toast } from 'sonner';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const GalleryManagement = () => {
  const { photos, loading, addPhoto, updatePhoto, deletePhoto, reorderPhotos } = useGalleryPhotos();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const [newPhoto, setNewPhoto] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
    display_order: photos.length
  });

  const handleImageUpload = async (file: File, isEdit = false) => {
    if (!file) return;

    setUploading(true);
    try {
      const { publicUrl } = await uploadToBannerBucket(file, 'backgrounds', 'gallery');
      
      if (isEdit && selectedPhoto) {
        setSelectedPhoto({ ...selectedPhoto, image_url: publicUrl });
      } else {
        setNewPhoto(prev => ({ ...prev, image_url: publicUrl }));
      }
      
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.title || !newPhoto.image_url) {
      toast.error('Título e imagem são obrigatórios');
      return;
    }

    const result = await addPhoto(newPhoto);
    if (result) {
      setNewPhoto({
        title: '',
        description: '',
        image_url: '',
        is_active: true,
        display_order: photos.length + 1
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditPhoto = async () => {
    if (!selectedPhoto) return;

    const result = await updatePhoto(selectedPhoto.id, {
      title: selectedPhoto.title,
      description: selectedPhoto.description,
      image_url: selectedPhoto.image_url,
      is_active: selectedPhoto.is_active
    });

    if (result) {
      setIsEditDialogOpen(false);
      setSelectedPhoto(null);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta foto?')) {
      await deletePhoto(id);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;
    
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedItem];
    
    newPhotos.splice(draggedItem, 1);
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    
    reorderPhotos(newPhotos);
    setDraggedItem(null);
  };

  return (
    <RoleProtectedRoute allowedRoles={['admin', 'convidado']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gradient-gold">Galeria de Atendimentos</h2>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-salon-dark border-salon-gold/20">
              <DialogHeader>
                <DialogTitle className="text-salon-gold">Adicionar Nova Foto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-salon-copper">Título</Label>
                  <Input
                    id="title"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-salon-purple/20 border-salon-gold/30 text-white"
                    placeholder="Digite o título da foto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-salon-copper">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-salon-purple/20 border-salon-gold/30 text-white"
                    placeholder="Descrição opcional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="image" className="text-salon-copper">Imagem</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="bg-salon-purple/20 border-salon-gold/30 text-white"
                    disabled={uploading}
                  />
                  {newPhoto.image_url && (
                    <img 
                      src={newPhoto.image_url} 
                      alt="Preview" 
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newPhoto.is_active}
                    onCheckedChange={(checked) => setNewPhoto(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="active" className="text-salon-copper">Foto ativa</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-salon-gold/30 text-salon-copper hover:bg-salon-gold/10"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddPhoto}
                    disabled={uploading || !newPhoto.title || !newPhoto.image_url}
                    className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
                  >
                    {uploading ? 'Enviando...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando galeria...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <Card 
                  key={photo.id} 
                  className={`glass-card border-salon-gold/20 cursor-move ${!photo.is_active ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <GripVertical className="w-4 h-4 text-salon-gold" />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setIsEditDialogOpen(true);
                          }}
                          className="text-salon-copper hover:text-salon-gold"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <img 
                        src={photo.image_url} 
                        alt={photo.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <h3 className="text-salon-gold font-semibold">{photo.title}</h3>
                      {photo.description && (
                        <p className="text-salon-copper text-sm">{photo.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Ordem: {photo.display_order}</span>
                        <span className={photo.is_active ? 'text-green-400' : 'text-red-400'}>
                          {photo.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {photos.length === 0 && (
              <Card className="glass-card border-salon-gold/20 text-center py-12">
                <CardContent>
                  <Image className="w-16 h-16 mx-auto text-salon-gold mb-4" />
                  <h3 className="text-xl text-salon-gold mb-2">Nenhuma foto encontrada</h3>
                  <p className="text-salon-copper mb-4">Adicione fotos dos seus atendimentos para criar um banner rotativo</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-salon-dark border-salon-gold/20">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">Editar Foto</DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title" className="text-salon-copper">Título</Label>
                  <Input
                    id="edit-title"
                    value={selectedPhoto.title}
                    onChange={(e) => setSelectedPhoto(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="bg-salon-purple/20 border-salon-gold/30 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description" className="text-salon-copper">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedPhoto.description || ''}
                    onChange={(e) => setSelectedPhoto(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="bg-salon-purple/20 border-salon-gold/30 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-image" className="text-salon-copper">Alterar Imagem</Label>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, true);
                    }}
                    className="bg-salon-purple/20 border-salon-gold/30 text-white"
                    disabled={uploading}
                  />
                  <img 
                    src={selectedPhoto.image_url} 
                    alt="Preview" 
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={selectedPhoto.is_active}
                    onCheckedChange={(checked) => setSelectedPhoto(prev => prev ? { ...prev, is_active: checked } : null)}
                  />
                  <Label htmlFor="edit-active" className="text-salon-copper">Foto ativa</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedPhoto(null);
                    }}
                    className="border-salon-gold/30 text-salon-copper hover:bg-salon-gold/10"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleEditPhoto}
                    disabled={uploading}
                    className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
                  >
                    {uploading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtectedRoute>
  );
};

export default GalleryManagement;
