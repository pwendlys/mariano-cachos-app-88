
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import type { AdvancedDashboardMetrics } from '@/hooks/useAdvancedDashboardMetrics';

interface RevenueExpensesChartProps {
  monthlyData: AdvancedDashboardMetrics['monthlyData'];
}

const RevenueExpensesChart = ({ monthlyData }: RevenueExpensesChartProps) => {
  const chartConfig = {
    revenue: {
      label: "Receita",
      color: "hsl(var(--salon-gold))",
    },
    expenses: {
      label: "Despesas",
      color: "hsl(0, 84%, 60%)",
    }
  };

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold">Receitas vs Despesas (Últimos 6 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
              />
              <YAxis 
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--salon-gold))"
                name="Receita"
              />
              <Bar
                dataKey="expenses"
                fill="hsl(0, 84%, 60%)"
                name="Despesas"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueExpensesChart;
