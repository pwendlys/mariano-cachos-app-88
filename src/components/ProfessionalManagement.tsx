
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, User, Star, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseProfessionals } from '@/hooks/useSupabaseProfessionals';
import { useSupabaseCommissions } from '@/hooks/useSupabaseCommissions';

const ProfessionalManagement = () => {
  const { professionals, loading, addProfessional, updateProfessional, deleteProfessional } = useSupabaseProfessionals();
  const { commissions, getTotalCommissionsByProfessional } = useSupabaseCommissions();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidades: [] as string[],
    percentual_comissao_padrao: 0,
    ativo: true
  });

  const handleAddProfessional = async () => {
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addProfessional(formData);
      setIsAddDialogOpen(false);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        especialidades: [],
        percentual_comissao_padrao: 0,
        ativo: true
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateProfessional = async (id: string, updates: any) => {
    try {
      await updateProfessional(id, updates);
      setEditingProfessional(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      try {
        await deleteProfessional(id);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const showDetails = (professional: any) => {
    setSelectedProfessional(professional);
    setIsDetailsDialogOpen(true);
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.especialidades.includes(specialty)) {
      setFormData({
        ...formData,
        especialidades: [...formData.especialidades, specialty]
      });
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      especialidades: formData.especialidades.filter(s => s !== specialty)
    });
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
        <h2 className="text-xl font-semibold text-salon-gold">Profissionais</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium">
              <Plus className="mr-2" size={16} />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">Novo Profissional</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">Nome *</Label>
                <Input
                  id="name"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome do profissional"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="commission" className="text-sm font-medium mb-2 block">Comissão Padrão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentual_comissao_padrao}
                  onChange={(e) => setFormData({...formData, percentual_comissao_padrao: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                />
                <Label htmlFor="active" className="text-sm font-medium">Ativo</Label>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleAddProfessional}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium"
                >
                  Adicionar Profissional
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((professional) => (
          <Card key={professional.id} className="glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-salon-gold/20 flex items-center justify-center">
                    <User size={20} className="text-salon-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{professional.nome}</h3>
                    <p className="text-sm text-salon-copper">{professional.email}</p>
                  </div>
                </div>
                <Badge className={professional.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {professional.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-salon-copper">Telefone:</span>
                  <span className="text-sm text-white">{professional.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-salon-gold" />
                  <span className="text-sm text-salon-copper">Comissão:</span>
                  <span className="text-sm text-salon-gold">{professional.percentual_comissao_padrao}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-salon-gold" />
                  <span className="text-sm text-salon-copper">Total comissões:</span>
                  <span className="text-sm text-salon-gold">
                    R$ {getTotalCommissionsByProfessional(professional.id).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {professional.especialidades && professional.especialidades.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-salon-copper mb-2">Especialidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {professional.especialidades.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-salon-gold/20 text-salon-gold">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => showDetails(professional)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  <Star size={16} className="mr-2" />
                  Detalhes
                </Button>
                <Button
                  onClick={() => handleDeleteProfessional(professional.id)}
                  variant="destructive"
                  size="sm"
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">Detalhes do Profissional</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-salon-gold/20 flex items-center justify-center">
                  <User size={24} className="text-salon-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{selectedProfessional.nome}</h3>
                  <p className="text-salon-copper">{selectedProfessional.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-salon-copper">Telefone</p>
                  <p className="text-white">{selectedProfessional.telefone}</p>
                </div>
                
                <div>
                  <p className="text-sm text-salon-copper">Comissão Padrão</p>
                  <p className="text-salon-gold">{selectedProfessional.percentual_comissao_padrao}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-salon-copper">Total de Comissões Calculadas</p>
                  <p className="text-salon-gold text-lg font-semibold">
                    R$ {getTotalCommissionsByProfessional(selectedProfessional.id).toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-salon-copper">Status</p>
                  <Badge className={selectedProfessional.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {selectedProfessional.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                {selectedProfessional.especialidades && selectedProfessional.especialidades.length > 0 && (
                  <div>
                    <p className="text-sm text-salon-copper mb-2">Especialidades</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfessional.especialidades.map((specialty: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-salon-gold/20 text-salon-gold">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditingProfessional(selectedProfessional.id)}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium"
                >
                  <Edit2 size={16} className="mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => setIsDetailsDialogOpen(false)}
                  variant="outline"
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalManagement;
