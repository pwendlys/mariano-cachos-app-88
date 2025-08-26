
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold">Receitas vs Despesas (Últimos 6 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--salon-gold))" opacity={0.1} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
              />
              <YAxis 
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
                tickFormatter={formatCurrency}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend 
                wrapperStyle={{ color: 'hsl(var(--salon-gold))' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--salon-gold))"
                strokeWidth={3}
                name="Receita"
                dot={{ fill: 'hsl(var(--salon-gold))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--salon-gold))', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={3}
                name="Despesas"
                dot={{ fill: 'hsl(0, 84%, 60%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(0, 84%, 60%)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueExpensesChart;
