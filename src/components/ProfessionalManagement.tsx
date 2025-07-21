
import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone, Upload, X, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseProfessionals, SupabaseProfessional } from '@/hooks/useSupabaseProfessionals';
import { useSupabaseCommissions } from '@/hooks/useSupabaseCommissions';
import CommissionManagement from '@/components/CommissionManagement';

const ProfessionalManagement = () => {
  const { toast } = useToast();
  const { professionals, loading, addProfessional, updateProfessional, deleteProfessional } = useSupabaseProfessionals();
  const { getTotalCommissionsByProfessional } = useSupabaseCommissions();

  const [editingProfessional, setEditingProfessional] = useState<SupabaseProfessional | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidades: [] as string[],
    avatar: '',
    ativo: true,
    percentual_comissao_padrao: 30
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

  const handleEdit = (professional: SupabaseProfessional) => {
    setEditingProfessional(professional);
    setFormData({
      nome: professional.nome,
      email: professional.email,
      telefone: professional.telefone,
      especialidades: professional.especialidades,
      avatar: professional.avatar || '',
      ativo: professional.ativo,
      percentual_comissao_padrao: professional.percentual_comissao_padrao || 30
    });
    setImagePreview(professional.avatar || '');
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProfessional(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      especialidades: [],
      avatar: '',
      ativo: true,
      percentual_comissao_padrao: 30
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
      especialidades: prev.especialidades.includes(specialty)
        ? prev.especialidades.filter(s => s !== specialty)
        : [...prev.especialidades, specialty]
    }));
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (formData.especialidades.length === 0) {
      toast({
        title: "Selecione pelo menos uma especialidade",
        description: "É necessário selecionar pelo menos uma especialidade para o profissional.",
        variant: "destructive"
      });
      return;
    }

    if (formData.percentual_comissao_padrao < 0 || formData.percentual_comissao_padrao > 100) {
      toast({
        title: "Percentual de comissão inválido",
        description: "O percentual de comissão deve estar entre 0% e 100%.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingProfessional) {
        await updateProfessional(editingProfessional.id, formData);
      } else {
        await addProfessional(formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async (professionalId: string) => {
    try {
      await deleteProfessional(professionalId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const toggleActiveStatus = async (professional: SupabaseProfessional) => {
    try {
      await updateProfessional(professional.id, { ativo: !professional.ativo });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando profissionais...</div>
      </div>
    );
  }

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
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
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
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comissão Padrão (%) *</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.percentual_comissao_padrao}
                    onChange={(e) => setFormData({...formData, percentual_comissao_padrao: parseFloat(e.target.value) || 0})}
                    placeholder="30"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12 pr-10"
                  />
                  <Percent className="absolute right-3 top-3 text-salon-gold" size={16} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Percentual padrão de comissão sobre serviços e produtos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Especialidades *</label>
                <div className="grid grid-cols-2 gap-2 p-4 glass-card border-salon-gold/30 rounded-lg">
                  {availableSpecialties.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.especialidades.includes(specialty)}
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
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked as boolean})}
                />
                <label htmlFor="ativo" className="text-sm text-white cursor-pointer">
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

      <Tabs defaultValue="professionals" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card p-1">
          <TabsTrigger value="professionals" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
            Profissionais
          </TabsTrigger>
          <TabsTrigger value="commissions" className="data-[state=active]:bg-salon-gold/20 data-[state=active]:text-salon-gold">
            Comissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="professionals" className="space-y-4">
          <div className="grid gap-4">
            {professionals.map((professional) => (
              <Card key={professional.id} className="glass-card border-salon-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {professional.avatar && (
                      <div className="flex-shrink-0">
                        <img 
                          src={professional.avatar} 
                          alt={professional.nome}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-white text-lg">{professional.nome}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          professional.ativo 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {professional.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-salon-copper">
                          <Mail size={14} />
                          <span className="text-sm">{professional.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-salon-copper">
                          <Phone size={14} />
                          <span className="text-sm">{professional.telefone}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-salon-gold">
                          <Percent size={14} />
                          <span className="text-sm">Comissão: {professional.percentual_comissao_padrao}%</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-400">
                          <DollarSign size={14} />
                          <span className="text-sm">
                            Comissões pendentes: R$ {getTotalCommissionsByProfessional(professional.id).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Especialidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {professional.especialidades.map((specialty) => (
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
                          professional.ativo ? 'text-yellow-400' : 'text-green-400'
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
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalManagement;
