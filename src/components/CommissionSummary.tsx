
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, TrendingUp, Users, Clock } from 'lucide-react';
import { CommissionWithDetails } from '@/hooks/useSupabaseCommissions';

interface CommissionSummaryProps {
  commissions: CommissionWithDetails[];
}

const CommissionSummary = ({ commissions }: CommissionSummaryProps) => {
  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.valor_comissao), 0);
  
  const paidCommissions = commissions
    .filter(c => c.status === 'paga')
    .reduce((sum, c) => sum + Number(c.valor_comissao), 0);
  
  const pendingCommissions = commissions
    .filter(c => c.status === 'calculada')
    .reduce((sum, c) => sum + Number(c.valor_comissao), 0);

  const uniqueProfessionals = new Set(commissions.map(c => c.profissional_id)).size;

  const summaryCards = [
    {
      title: 'Total de Comissões',
      value: `R$ ${totalCommissions.toFixed(2)}`,
      icon: Calculator,
      color: 'text-salon-gold'
    },
    {
      title: 'Comissões Pagas',
      value: `R$ ${paidCommissions.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Comissões Pendentes',
      value: `R$ ${pendingCommissions.toFixed(2)}`,
      icon: Clock,
      color: 'text-yellow-400'
    },
    {
      title: 'Profissionais',
      value: uniqueProfessionals.toString(),
      icon: Users,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => (
        <Card key={index} className="glass-card border-salon-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-salon-copper">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <card.icon className={`${card.color}`} size={24} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommissionSummary;
