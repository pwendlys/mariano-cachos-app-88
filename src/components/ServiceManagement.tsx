import React, { useState, useEffect } from 'react';
import { Settings, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useSupabaseServices, SupabaseService } from '@/hooks/useSupabaseServices';
import { useToast } from '@/hooks/use-toast';

const ServiceManagement = () => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    preco: '',
    duracao: '',
    ativo: true,
    detalhes: '',
  });
  const [editingService, setEditingService] = useState<SupabaseService | null>(null);
  const { services, loading, createService, updateService, deleteService, fetchServices } = useSupabaseServices();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      preco: '',
      duracao: '',
      ativo: true,
      detalhes: '',
    });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      nome: formData.nome,
      categoria: formData.categoria,
      preco: parseFloat(formData.preco),
      duracao: parseInt(formData.duracao),
      ativo: formData.ativo,
      detalhes: formData.detalhes,
    };

    const success = editingService
      ? await updateService(editingService.id, serviceData)
      : await createService(serviceData);

    if (success) {
      resetForm();
    }
  };

  const handleEditService = (service: SupabaseService) => {
    setEditingService(service);
    setFormData({
      nome: service.nome,
      categoria: service.categoria,
      preco: service.preco.toString(),
      duracao: service.duracao.toString(),
      ativo: service.ativo,
      detalhes: service.detalhes || '',
    });
  };

  const handleDeleteService = async (id: string) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este serviço?");
    if (confirmDelete) {
      await deleteService(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Settings size={20} />
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Nome do Serviço *</label>
              <Input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Ex: Corte feminino"
                required
                className="glass-card border-salon-gold/30 bg-transparent text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Categoria *</label>
              <Input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                placeholder="Ex: corte, coloracao, tratamento"
                required
                className="glass-card border-salon-gold/30 bg-transparent text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Preço (R$) *</label>
                <Input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Duração (min) *</label>
                <Input
                  type="number"
                  name="duracao"
                  value={formData.duracao}
                  onChange={handleInputChange}
                  placeholder="60"
                  min="1"
                  required
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Detalhes</label>
              <Textarea
                name="detalhes"
                value={formData.detalhes}
                onChange={handleInputChange}
                placeholder="Descrição do serviço..."
                className="glass-card border-salon-gold/30 bg-transparent text-white"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked as boolean }))}
                className="border-salon-gold/30"
              />
              <label htmlFor="ativo" className="text-sm text-white">
                Serviço ativo
              </label>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark"
              >
                {editingService ? 'Atualizar' : 'Criar'} Serviço
              </Button>
              
              {editingService && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold">Lista de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-400">Carregando serviços...</p>
          ) : services.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum serviço cadastrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="p-4 rounded-md border border-salon-gold/30">
                  <h3 className="text-lg font-semibold text-white">{service.nome}</h3>
                  <p className="text-sm text-gray-300">Categoria: {service.categoria}</p>
                  <p className="text-sm text-gray-300">Preço: R$ {service.preco.toFixed(2)}</p>
                  <p className="text-sm text-gray-300">Duração: {service.duracao} minutos</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceManagement;
