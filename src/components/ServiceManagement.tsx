
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, DollarSign, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseServices, SupabaseService } from '@/hooks/useSupabaseServices';

const ServiceManagement = () => {
  const { toast } = useToast();
  const { services, addService, updateService, deleteService, loading } = useSupabaseServices();

  const [editingService, setEditingService] = useState<SupabaseService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'corte' as 'corte' | 'coloracao' | 'tratamento' | 'finalizacao' | 'outros',
    preco: '',
    duracao: ''
  });

  const categoryOptions = [
    { value: 'corte', label: 'Corte' },
    { value: 'coloracao', label: 'Coloração' },
    { value: 'tratamento', label: 'Tratamento' },
    { value: 'finalizacao', label: 'Finalização' },
    { value: 'outros', label: 'Outros' }
  ];

  const handleEdit = (service: SupabaseService) => {
    setEditingService(service);
    setFormData({
      nome: service.nome,
      categoria: service.categoria,
      preco: service.preco.toString(),
      duracao: service.duracao.toString()
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({
      nome: '',
      categoria: 'corte',
      preco: '',
      duracao: ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.preco || !formData.duracao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const serviceData = {
      nome: formData.nome,
      categoria: formData.categoria,
      preco: parseFloat(formData.preco),
      duracao: parseInt(formData.duracao),
      ativo: true
    };

    let success = false;
    if (editingService) {
      success = await updateService(editingService.id, serviceData);
    } else {
      success = await addService(serviceData);
    }

    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Tem certeza que deseja desativar este serviço?')) {
      await deleteService(serviceId);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const getCategoryLabel = (categoria: string) => {
    const option = categoryOptions.find(opt => opt.value === categoria);
    return option ? option.label : categoria;
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando serviços...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Gestão de Serviços</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAdd}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12 px-6"
              disabled={loading}
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
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Corte Especializado"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Categoria *</label>
                <Select value={formData.categoria} onValueChange={(value: any) => setFormData({...formData, categoria: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-12">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preço (R$) *</label>
                  <Input
                    type="number"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    placeholder="0.00"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duração (min) *</label>
                  <Input
                    type="number"
                    value={formData.duracao}
                    onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                    placeholder="60"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={loading}
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
        {services.filter(service => service.ativo).map((service) => (
          <Card key={service.id} className="glass-card border-salon-gold/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{service.nome}</h3>
                  <p className="text-sm text-salon-copper mt-1">{getCategoryLabel(service.categoria)}</p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1 text-salon-gold">
                      <DollarSign size={16} />
                      <span className="font-bold">R$ {service.preco.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-salon-copper">
                      <Clock size={16} />
                      <span>{formatDuration(service.duracao)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(service)}
                    disabled={loading}
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12 w-12"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(service.id)}
                    disabled={loading}
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-12 w-12"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {services.filter(service => service.ativo).length === 0 && (
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="pt-6">
              <div className="text-center text-salon-copper">
                <p>Nenhum serviço ativo encontrado</p>
                <p className="text-sm mt-2">Adicione serviços para começar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;
