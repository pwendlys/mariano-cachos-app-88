
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Package, DollarSign } from 'lucide-react';
import type { DashboardMetrics } from '@/hooks/useDashboardMetrics';

interface DashboardKPIsProps {
  metrics: DashboardMetrics;
}

const DashboardKPIs = ({ metrics }: DashboardKPIsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-card border-salon-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-salon-gold">
            Receita Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-salon-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-salon-gold">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receita acumulada
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-salon-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-salon-gold">
            Agendamentos
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-salon-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-salon-gold">
            {metrics.totalAppointments}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de agendamentos
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-salon-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-salon-gold">
            Produtos
          </CardTitle>
          <Package className="h-4 w-4 text-salon-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-salon-gold">
            {metrics.totalProducts}
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos ativos
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-salon-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-salon-gold">
            Clientes
          </CardTitle>
          <Users className="h-4 w-4 text-salon-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-salon-gold">
            {metrics.totalCustomers}
          </div>
          <p className="text-xs text-muted-foreground">
            Clientes cadastrados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardKPIs;
