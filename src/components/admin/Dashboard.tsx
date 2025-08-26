
import React from 'react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardKPIs from './DashboardKPIs';
import SalesChart from './SalesChart';
import AppointmentsStatusChart from './AppointmentsStatusChart';
import TopProductsCard from './TopProductsCard';
import LowStockAlert from './LowStockAlert';

interface DashboardProps {
  onEditService?: (serviceId: string) => void;
}

const Dashboard = ({ onEditService }: DashboardProps) => {
  const { metrics, loading } = useDashboardMetrics();

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do seu salão
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Erro ao carregar dados do dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do seu salão
        </p>
      </div>

      {/* KPIs */}
      <DashboardKPIs metrics={metrics} />

      {/* Gráficos principais */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart salesData={metrics.salesData} />
        <AppointmentsStatusChart appointmentsByStatus={metrics.appointmentsByStatus} />
      </div>

      {/* Produtos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProductsCard products={metrics.topProducts} />
        <LowStockAlert products={metrics.lowStockProducts} />
      </div>
    </div>
  );
};

export default Dashboard;
