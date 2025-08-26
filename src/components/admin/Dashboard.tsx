
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdvancedDashboardMetrics } from '@/hooks/useAdvancedDashboardMetrics';
import { CalendarDays, Users, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import RevenueExpensesChart from './RevenueExpensesChart';
import PopularServicesChart from './PopularServicesChart';
import TopProductsBarChart from './TopProductsBarChart';

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState('30');
  const { metrics, loading } = useAdvancedDashboardMetrics(timeframe);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground">
            Análise completa do desempenho do salão
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
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
            Dashboard Executivo
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2 font-playfair">
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground">
            Análise completa do desempenho do salão
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-48 glass-card border-salon-gold/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs Principais */}
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
              Período selecionado
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">
              Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(metrics.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Período selecionado
            </p>
          </CardContent>
        </Card>

        <Card className={`glass-card ${metrics.netProfit >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Lucro Líquido
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(metrics.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita - Despesas
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
              Período selecionado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Receitas vs Despesas */}
      <div className="grid gap-6">
        <RevenueExpensesChart monthlyData={metrics.monthlyData} />
      </div>

      {/* Gráficos de Análise */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PopularServicesChart popularServices={metrics.popularServices} />
        <TopProductsBarChart topProducts={metrics.topProducts} />
      </div>
    </div>
  );
};

export default Dashboard;
