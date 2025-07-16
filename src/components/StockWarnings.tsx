
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface StockWarningsProps {
  warnings: string[];
  onDismiss: () => void;
}

const StockWarnings = ({ warnings, onDismiss }: StockWarningsProps) => {
  if (warnings.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 space-y-2">
      {warnings.map((warning, index) => (
        <Alert key={index} className="bg-orange-500/10 border-orange-500/30 text-orange-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{warning}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-orange-300 hover:bg-orange-500/20"
              onClick={onDismiss}
            >
              <X size={14} />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default StockWarnings;
