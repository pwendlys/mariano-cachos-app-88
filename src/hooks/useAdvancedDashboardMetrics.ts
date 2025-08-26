
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedDashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalAppointments: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  popularServices: Array<{
    id: string;
    nome: string;
    total_appointments: number;
    revenue: number;
  }>;
  topProducts: Array<{
    id: string;
    nome: string;
    categoria: string;
    vendas: number;
    revenue: number;
  }>;
}

export const useAdvancedDashboardMetrics = (timeframe: string = '30') => {
  const [metrics, setMetrics] = useState<AdvancedDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

      // Buscar receitas (entradas no fluxo de caixa)
      const { data: revenueData } = await supabase
        .from('fluxo_caixa')
        .select('valor, data')
        .eq('tipo', 'entrada')
        .gte('data', daysAgo.toISOString().split('T')[0]);

      const totalRevenue = revenueData?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

      // Buscar despesas (saídas no fluxo de caixa)
      const { data: expensesData } = await supabase
        .from('fluxo_caixa')
        .select('valor, data')
        .eq('tipo', 'saida')
        .gte('data', daysAgo.toISOString().split('T')[0]);

      const totalExpenses = expensesData?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

      // Buscar total de agendamentos
      const { count: totalAppointments } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .gte('data', daysAgo.toISOString().split('T')[0]);

      // Buscar dados mensais dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlyRevenueData } = await supabase
        .from('fluxo_caixa')
        .select('valor, data, tipo')
        .gte('data', sixMonthsAgo.toISOString().split('T')[0]);

      const monthlyDataMap = new Map();
      monthlyRevenueData?.forEach(item => {
        const monthKey = new Date(item.data).toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!monthlyDataMap.has(monthKey)) {
          monthlyDataMap.set(monthKey, { revenue: 0, expenses: 0 });
        }
        
        if (item.tipo === 'entrada') {
          monthlyDataMap.get(monthKey).revenue += Number(item.valor);
        } else {
          monthlyDataMap.get(monthKey).expenses += Number(item.valor);
        }
      });

      const monthlyData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses
      }));

      // Buscar serviços mais populares
      const { data: servicesData } = await supabase
        .from('agendamentos')
        .select(`
          servico_id,
          valor,
          servicos!inner(nome)
        `)
        .eq('status', 'concluido')
        .gte('data', daysAgo.toISOString().split('T')[0]);

      const servicesMap = new Map();
      servicesData?.forEach(item => {
        const serviceId = item.servico_id;
        const serviceName = item.servicos.nome;
        
        if (!servicesMap.has(serviceId)) {
          servicesMap.set(serviceId, {
            id: serviceId,
            nome: serviceName,
            total_appointments: 0,
            revenue: 0
          });
        }
        
        servicesMap.get(serviceId).total_appointments += 1;
        servicesMap.get(serviceId).revenue += Number(item.valor || 0);
      });

      const popularServices = Array.from(servicesMap.values())
        .sort((a, b) => b.total_appointments - a.total_appointments)
        .slice(0, 5);

      // Buscar produtos mais vendidos (simulação baseada no estoque)
      const { data: topProductsData } = await supabase
        .from('produtos')
        .select('id, nome, categoria, estoque')
        .eq('ativo', true)
        .order('estoque', { ascending: false })
        .limit(5);

      const topProducts = topProductsData?.map(product => ({
        ...product,
        vendas: Math.floor(Math.random() * 50) + 10,
        revenue: (Math.floor(Math.random() * 50) + 10) * Math.floor(Math.random() * 100) + 50
      })) || [];

      setMetrics({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        totalAppointments: totalAppointments || 0,
        monthlyData,
        popularServices,
        topProducts
      });
    } catch (error) {
      console.error('Erro ao buscar métricas avançadas do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeframe]);

  return {
    metrics,
    loading,
    refetch: fetchMetrics
  };
};
