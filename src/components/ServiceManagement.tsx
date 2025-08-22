
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseServices, SupabaseService } from '@/hooks/useSupabaseServices';

const ServiceManagement = () => {
  const { toast } = useToast();
  const { services, addService, updateService, deleteService, loading } = useSupabaseServices();

  const [editingService, setEditingService] = useState<SupabaseService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    preco: '',
    duracao: '',
    detalhes: ''
  });

  // Get unique categories from existing services for auto-suggestions
  const existingCategories = Array.from(new Set(services.map(service => service.categoria))).sort();

  const handleEdit = (service: SupabaseService) => {
    setEditingService(service);
    setFormData({
      nome: service.nome,
      categoria: service.categoria,
      preco: service.preco.toString(),
      duracao: service.duracao.toString(),
      detalhes: service.detalhes || ''
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({
      nome: '',
      categoria: '',
      preco: '',
      duracao: '',
      detalhes: ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.categoria || !formData.preco || !formData.duracao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const serviceData = {
      nome: formData.nome,
      categoria: formData.categoria.trim(),
      preco: parseFloat(formData.preco),
      duracao: parseInt(formData.duracao),
      ativo: true,
      imagem: null,
      detalhes: formData.detalhes || null
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
                <Input
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  placeholder="Digite ou selecione uma categoria"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {existingCategories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {existingCategories.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Categorias existentes:</p>
                    <div className="flex flex-wrap gap-1">
                      {existingCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setFormData({...formData, categoria: category})}
                          className="text-xs px-2 py-1 bg-salon-gold/20 text-salon-gold rounded hover:bg-salon-gold/30 transition-colors"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

              <div>
                <label className="block text-sm font-medium mb-2">Detalhes</label>
                <Textarea
                  value={formData.detalhes}
                  onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
                  placeholder="Descreva os detalhes do serviço que serão exibidos ao cliente durante o agendamento..."
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                  rows={3}
                />
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
                  <p className="text-sm text-salon-copper mt-1 capitalize">{service.categoria}</p>
                  
                  {service.detalhes && (
                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                      {service.detalhes}
                    </p>
                  )}
                  
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
