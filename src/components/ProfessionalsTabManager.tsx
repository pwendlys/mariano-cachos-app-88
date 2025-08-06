
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calculator } from 'lucide-react';
import ProfessionalManagement from '@/components/ProfessionalManagement';
import CommissionManagement from '@/components/CommissionManagement';

const ProfessionalsTabManager = () => {
  const [activeTab, setActiveTab] = useState('professionals');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
          Gestão de Profissionais
        </h2>
        <p className="text-muted-foreground">
          Gerencie profissionais e suas comissões
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card border-salon-gold/20">
          <TabsTrigger value="professionals" className="flex items-center gap-2">
            <Users size={16} />
            Gerenciar Profissionais
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <Calculator size={16} />
            Comissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="professionals" className="space-y-6 mt-6">
          <ProfessionalManagement />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6 mt-6">
          <CommissionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalsTabManager;
