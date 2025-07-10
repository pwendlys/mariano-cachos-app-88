
import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone, Upload, X, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useProfessionals, Professional } from '@/hooks/useProfessionals';

const ProfessionalManagement = () => {
  const { toast } = useToast();
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useProfessionals();

  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    avatar: '',
    isActive: true,
    commissionPercentage: 30
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  const availableSpecialties = [
    'Cortes',
    'Coloração',
    'Hidratação',
    'Finalização',
    'Escova',
    'Penteados',
    'Tratamentos',
    'Mechas',
    'Progressiva',
    'Botox Capilar'
  ];

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      specialties: professional.specialties,
      avatar: professional.avatar || '',
      isActive: professional.isActive,
      commissionPercentage: professional.commissionPercentage || 30
    });
    setImagePreview(professional.avatar || '');
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProfessional(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      avatar: '',
      isActive: true,
      commissionPercentage: 30
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
        setFormData({ ...formData, avatar: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData({ ...formData, avatar: '' });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (formData.specialties.length === 0) {
      toast({
        title: "Selecione pelo menos uma especialidade",
        description: "É necessário selecionar pelo menos uma especialidade para o profissional.",
        variant: "destructive"
      });
      return;
    }

    if (formData.commissionPercentage < 0 || formData.commissionPercentage > 100) {
      toast({
        title: "Percentual de comissão inválido",
        description: "O percentual de comissão deve estar entre 0% e 100%.",
        variant: "destructive"
      });
      return;
    }

    const professionalData: Professional = {
      id: editingProfessional?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialties: formData.specialties,
      avatar: formData.avatar || undefined,
      isActive: formData.isActive,
      commissionPercentage: formData.commissionPercentage
    };

    if (editingProfessional) {
      updateProfessional(editingProfessional.id, professionalData);
      toast({
        title: "Profissional atualizado!",
        description: "As informações do profissional foram atualizadas.",
      });
    } else {
      addProfessional(professionalData);
      toast({
        title: "Profissional adicionado!",
        description: "Novo profissional foi criado com sucesso.",
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (professionalId: string) => {
    deleteProfessional(professionalId);
    toast({
      title: "Profissional removido",
      description: "O profissional foi excluído do sistema.",
    });
  };

  const toggleActiveStatus = (professional: Professional) => {
    const updatedProfessional = { ...professional, isActive: !professional.isActive };
    updateProfessional(professional.id, updatedProfessional);
    toast({
      title: professional.isActive ? "Profissional desativado" : "Profissional ativado",
      description: `${professional.name} foi ${professional.isActive ? 'desativado' : 'ativado'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Gestão de Profissionais</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAdd}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12 px-6"
            >
              <Plus className="mr-2" size={16} />
              Novo Profissional
            </Button>
          </DialogTrigger>
          
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Maria Silva"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="maria@salon.com"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comissão (%) *</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionPercentage}
                    onChange={(e) => setFormData({...formData, commissionPercentage: parseFloat(e.target.value) || 0})}
                    placeholder="30"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12 pr-10"
                  />
                  <Percent className="absolute right-3 top-3 text-salon-gold" size={16} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Percentual de comissão sobre os serviços realizados
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Especialidades *</label>
                <div className="grid grid-cols-2 gap-2 p-4 glass-card border-salon-gold/30 rounded-lg">
                  {availableSpecialties.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyToggle(specialty)}
                      />
                      <label htmlFor={specialty} className="text-sm text-white cursor-pointer">
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foto do Profissional</label>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
                />
                <label htmlFor="isActive" className="text-sm text-white cursor-pointer">
                  Profissional ativo
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
                >
                  {editingProfessional ? 'Atualizar' : 'Criar'} Profissional
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
        {professionals.map((professional) => (
          <Card key={professional.id} className="glass-card border-salon-gold/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {professional.avatar && (
                  <div className="flex-shrink-0">
                    <img 
                      src={professional.avatar} 
                      alt={professional.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white text-lg">{professional.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      professional.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {professional.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center space-x-1 text-salon-copper">
                      <Mail size={14} />
                      <span className="text-sm">{professional.email}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-salon-copper">
                      <Phone size={14} />
                      <span className="text-sm">{professional.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-salon-gold">
                      <Percent size={14} />
                      <span className="text-sm">Comissão: {professional.commissionPercentage}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties.map((specialty) => (
                        <span key={specialty} className="text-xs bg-salon-gold/20 text-salon-gold px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(professional)}
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-10 w-10"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleActiveStatus(professional)}
                    className={`border-salon-gold/30 hover:bg-salon-gold/10 h-10 w-10 ${
                      professional.isActive ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    <User size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(professional.id)}
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-10 w-10"
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

export default ProfessionalManagement;
