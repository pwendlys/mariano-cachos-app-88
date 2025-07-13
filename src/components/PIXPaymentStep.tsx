
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// This component is deprecated - use PIXPaymentPopup instead
const PIXPaymentStep: React.FC = () => {
  return (
    <Card className="glass-card border-salon-gold/20">
      <CardContent className="pt-6">
        <div className="text-center text-salon-copper">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
          <p>Este componente foi substituído pelo PIXPaymentPopup</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PIXPaymentStep;
