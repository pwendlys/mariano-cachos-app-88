
import React, { useState } from 'react';
import { Edit2, Save, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AppointmentValueEditorProps {
  currentValue: number;
  onSave: (newValue: number) => Promise<boolean>;
  status: string;
}

const AppointmentValueEditor: React.FC<AppointmentValueEditorProps> = ({
  currentValue,
  onSave,
  status
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentValue.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      return;
    }

    setSaving(true);
    const success = await onSave(numericValue);
    setSaving(false);

    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(currentValue.toString());
    setIsEditing(false);
  };

  // Não permitir edição se já foi concluído
  const canEdit = status !== 'concluido';

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <DollarSign size={16} className="text-salon-gold" />
          <span className="text-lg font-bold text-salon-gold">
            R$ {currentValue.toFixed(2)}
          </span>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-salon-gold hover:bg-salon-gold/10"
          >
            <Edit2 size={12} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <DollarSign size={16} className="text-salon-gold" />
        <span className="text-sm text-salon-gold">R$</span>
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-24 h-8 text-salon-gold bg-transparent border-salon-gold/30"
          min="0.01"
          step="0.01"
          disabled={saving}
        />
      </div>
      <div className="flex gap-1">
        <Button
          onClick={handleSave}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-green-400 hover:bg-green-400/10"
          disabled={saving}
        >
          <Save size={12} />
        </Button>
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/10"
          disabled={saving}
        >
          <X size={12} />
        </Button>
      </div>
    </div>
  );
};

export default AppointmentValueEditor;
