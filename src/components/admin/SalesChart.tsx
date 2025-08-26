
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { DashboardMetrics } from '@/hooks/useDashboardMetrics';

interface SalesChartProps {
  salesData: DashboardMetrics['salesData'];
}

const SalesChart = ({ salesData }: SalesChartProps) => {
  const chartConfig = {
    revenue: {
      label: "Receita",
      color: "hsl(var(--salon-gold))",
    }
  };

  const formattedData = salesData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }));

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold">Receita dos Últimos 7 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
              />
              <YAxis 
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--salon-gold))"
                fill="hsl(var(--salon-gold))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
