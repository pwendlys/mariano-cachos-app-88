
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalRevenue: number;
  totalAppointments: number;
  totalProducts: number;
  totalCustomers: number;
  appointmentsByStatus: {
    pendente: number;
    confirmado: number;
    concluido: number;
    cancelado: number;
  };
  salesData: Array<{
    date: string;
    revenue: number;
    appointments: number;
  }>;
  topProducts: Array<{
    id: string;
    nome: string;
    categoria: string;
    estoque: number;
    vendas: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    nome: string;
    estoque: number;
    estoque_minimo: number;
  }>;
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Buscar receita total do fluxo de caixa
      const { data: revenueData } = await supabase
        .from('fluxo_caixa')
        .select('valor')
        .eq('tipo', 'entrada');

      const totalRevenue = revenueData?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

      // Buscar total de agendamentos
      const { count: totalAppointments } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true });

      // Buscar total de produtos ativos
      const { count: totalProducts } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Buscar total de clientes
      const { count: totalCustomers } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // Buscar agendamentos por status
      const { data: appointmentsStatus } = await supabase
        .from('agendamentos')
        .select('status');

      const appointmentsByStatus = appointmentsStatus?.reduce((acc, item) => {
        acc[item.status as keyof typeof acc] = (acc[item.status as keyof typeof acc] || 0) + 1;
        return acc;
      }, {
        pendente: 0,
        confirmado: 0,
        concluido: 0,
        cancelado: 0
      }) || {
        pendente: 0,
        confirmado: 0,
        concluido: 0,
        cancelado: 0
      };

      // Buscar dados de vendas dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: salesByDate } = await supabase
        .from('fluxo_caixa')
        .select('data, valor, tipo')
        .gte('data', sevenDaysAgo.toISOString().split('T')[0])
        .eq('tipo', 'entrada');

      const salesDataMap = new Map();
      salesByDate?.forEach(item => {
        const date = item.data;
        if (!salesDataMap.has(date)) {
          salesDataMap.set(date, { revenue: 0, appointments: 0 });
        }
        salesDataMap.get(date).revenue += Number(item.valor);
      });

      const salesData = Array.from(salesDataMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        appointments: data.appointments
      }));

      // Buscar produtos com baixo estoque
      const { data: lowStock } = await supabase
        .from('produtos')
        .select('id, nome, estoque, estoque_minimo')
        .eq('ativo', true)
        .filter('estoque', 'lte', 'estoque_minimo')
        .limit(5);

      // Buscar top produtos (simulação baseada no estoque vendido)
      const { data: topProductsData } = await supabase
        .from('produtos')
        .select('id, nome, categoria, estoque')
        .eq('ativo', true)
        .order('estoque', { ascending: false })
        .limit(5);

      const topProducts = topProductsData?.map(product => ({
        ...product,
        vendas: Math.floor(Math.random() * 50) + 10 // Simulação temporária
      })) || [];

      setMetrics({
        totalRevenue,
        totalAppointments: totalAppointments || 0,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        appointmentsByStatus,
        salesData,
        topProducts,
        lowStockProducts: lowStock || []
      });
    } catch (error) {
      console.error('Erro ao buscar métricas do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    refetch: fetchMetrics
  };
};
