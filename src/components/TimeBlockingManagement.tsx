
import React, { useState } from 'react';
import { Plus, Clock, Calendar, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTimeBlocking, TimeBlock } from '@/hooks/useTimeBlocking';
import { useProfessionals } from '@/hooks/useProfessionals';

const TimeBlockingManagement = () => {
  const { toast } = useToast();
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock } = useTimeBlocking();
  const { professionals } = useProfessionals();

  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    type: 'break' as TimeBlock['type'],
    professionalId: ''
  });

  const blockTypes = [
    { value: 'break', label: 'Intervalo/Almoço' },
    { value: 'holiday', label: 'Feriado' },
    { value: 'maintenance', label: 'Manutenção' },
    { value: 'other', label: 'Outros' }
  ];

  const handleEdit = (block: TimeBlock) => {
    setEditingBlock(block);
    setFormData({
      date: block.date,
      startTime: block.startTime,
      endTime: block.endTime,
      reason: block.reason,
      type: block.type,
      professionalId: block.professionalId || 'all'
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingBlock(null);
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
      type: 'break',
      professionalId: 'all'
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.reason) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Horário inválido",
        description: "O horário de fim deve ser posterior ao horário de início.",
        variant: "destructive"
      });
      return;
    }

    const blockData: TimeBlock = {
      id: editingBlock?.id || Date.now().toString(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      reason: formData.reason,
      type: formData.type,
      professionalId: formData.professionalId === 'all' ? undefined : formData.professionalId
    };

    if (editingBlock) {
      updateTimeBlock(editingBlock.id, blockData);
      toast({
        title: "Bloqueio atualizado!",
        description: "O bloqueio de horário foi atualizado.",
      });
    } else {
      addTimeBlock(blockData);
      toast({
        title: "Bloqueio criado!",
        description: "Novo bloqueio de horário foi criado.",
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (blockId: string) => {
    deleteTimeBlock(blockId);
    toast({
      title: "Bloqueio removido",
      description: "O bloqueio de horário foi excluído.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getTypeLabel = (type: string) => {
    return blockTypes.find(t => t.value === type)?.label || type;
  };

  const getProfessionalName = (professionalId?: string) => {
    if (!professionalId) return 'Todos os profissionais';
    const professional = professionals.find(p => p.id === professionalId);
    return professional?.name || 'Profissional não encontrado';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-salon-gold">Bloqueio de Horários</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAdd}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-10 px-4"
            >
              <Plus className="mr-2" size={16} />
              Novo Bloqueio
            </Button>
          </DialogTrigger>
          
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">
                {editingBlock ? 'Editar Bloqueio' : 'Novo Bloqueio'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Início *</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Fim *</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo *</label>
                <Select value={formData.type} onValueChange={(value: TimeBlock['type']) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-10">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30 bg-salon-dark text-white">
                    {blockTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profissional</label>
                <Select value={formData.professionalId} onValueChange={(value) => setFormData({...formData, professionalId: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white h-10">
                    <SelectValue placeholder="Todos os profissionais" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-salon-gold/30 bg-salon-dark text-white">
                    <SelectItem value="all">Todos os profissionais</SelectItem>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Motivo *</label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Ex: Horário de almoço"
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-10"
                >
                  {editingBlock ? 'Atualizar' : 'Criar'} Bloqueio
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {timeBlocks.length > 0 ? (
          timeBlocks.map((block) => (
            <Card key={block.id} className="glass-card border-salon-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar size={16} className="text-salon-gold" />
                      <span className="text-white font-medium">{formatDate(block.date)}</span>
                      <Clock size={16} className="text-salon-copper ml-4" />
                      <span className="text-salon-copper">{block.startTime} - {block.endTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{block.reason}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        block.type === 'holiday' ? 'bg-red-500/20 text-red-400' :
                        block.type === 'break' ? 'bg-yellow-500/20 text-yellow-400' :
                        block.type === 'maintenance' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getTypeLabel(block.type)}
                      </span>
                      <span className="text-salon-gold">{getProfessionalName(block.professionalId)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(block)}
                      className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-8 w-8"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(block.id)}
                      className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-8 w-8"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="glass-card border-salon-gold/20">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum bloqueio de horário cadastrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TimeBlockingManagement;
