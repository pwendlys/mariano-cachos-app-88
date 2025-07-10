import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, DollarSign, Upload, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSharedServices, Service } from '@/hooks/useSharedServices';
import { useProfessionals } from '@/hooks/useProfessionals';

const ServiceManagement = () => {
  const { toast } = useToast();
  const { services, addService, updateService, deleteService } = useSharedServices();
  const { professionals } = useProfessionals();

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image: '',
    professionalIds: [] as string[]
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      image: service.image || '',
      professionalIds: service.professionalIds || []
    });
    setImagePreview(service.image || '');
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      image: '',
      professionalIds: []
    });
    setImagePreview('');
    setIsDialogOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setFormData({ ...formData, image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const handleProfessionalToggle = (professionalId: string) => {
    setFormData(prev => ({
      ...prev,
      professionalIds: prev.professionalIds.includes(professionalId)
        ? prev.professionalIds.filter(id => id !== professionalId)
        : [...prev.professionalIds, professionalId]
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (formData.professionalIds.length === 0) {
      toast({
        title: "Selecione pelo menos um profissional",
        description: "É necessário selecionar pelo menos um profissional para o serviço.",
        variant: "destructive"
      });
      return;
    }

    const serviceData: Service = {
      id: editingService?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      image: formData.image || undefined,
      professionalIds: formData.professionalIds
    };

    if (editingService) {
      updateService(editingService.id, serviceData);
      toast({
        title: "Serviço atualizado!",
        description: "As informações do serviço foram atualizadas.",
      });
    } else {
      addService(serviceData);
      toast({
        title: "Serviço adicionado!",
        description: "Novo serviço foi criado com sucesso.",
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (serviceId: string) => {
    deleteService(serviceId);
    toast({
      title: "Serviço removido",
      description: "O serviço foi excluído do sistema.",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const getProfessionalNames = (professionalIds: string[] | undefined) => {
    if (!professionalIds || professionalIds.length === 0) {
      return 'Nenhum profissional';
    }
    
    return professionalIds
      .map(id => professionals.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'Profissionais não encontrados';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Gestão de Serviços</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAdd}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12 px-6"
            >
              <Plus className="mr-2" size={16} />
              Novo Serviço
            </Button>
          </DialogTrigger>
          
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Serviço *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Corte Especializado"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o serviço..."
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profissionais que realizam este serviço *</label>
                <div className="space-y-2 p-4 glass-card border-salon-gold/30 rounded-lg">
                  {professionals.map((professional) => (
                    <div key={professional.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={professional.id}
                        checked={formData.professionalIds.includes(professional.id)}
                        onCheckedChange={() => handleProfessionalToggle(professional.id)}
                      />
                      <label htmlFor={professional.id} className="text-sm text-white cursor-pointer">
                        {professional.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foto do Serviço</label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-salon-gold/30 rounded-lg p-4 text-center">
                      <Upload className="mx-auto text-salon-gold mb-2" size={24} />
                      <p className="text-sm text-muted-foreground">Clique para adicionar uma foto</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preço (R$) *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duração (min) *</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="60"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
                >
                  {editingService ? 'Atualizar' : 'Criar'} Serviço
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id} className="glass-card border-salon-gold/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {service.image && (
                  <div className="flex-shrink-0">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  
                  <div className="flex items-center space-x-1 mt-2 text-salon-copper">
                    <Users size={14} />
                    <span className="text-xs">{getProfessionalNames(service.professionalIds)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1 text-salon-gold">
                      <DollarSign size={16} />
                      <span className="font-bold">R$ {service.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-salon-copper">
                      <Clock size={16} />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(service)}
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12 w-12"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(service.id)}
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-12 w-12"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceManagement;
