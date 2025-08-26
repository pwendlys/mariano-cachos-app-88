
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { AdvancedDashboardMetrics } from '@/hooks/useAdvancedDashboardMetrics';

interface TopProductsBarChartProps {
  topProducts: AdvancedDashboardMetrics['topProducts'];
}

const TopProductsBarChart = ({ topProducts }: TopProductsBarChartProps) => {
  const chartConfig = {
    vendas: {
      label: "Vendas",
      color: "hsl(var(--salon-gold))",
    }
  };

  const data = topProducts.map(product => ({
    nome: product.nome.length > 15 ? product.nome.substring(0, 15) + '...' : product.nome,
    vendas: product.vendas
  }));

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold">Top Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <XAxis 
                type="number"
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
              />
              <YAxis 
                type="category"
                dataKey="nome"
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
                width={100}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="vendas"
                fill="hsl(var(--salon-gold))"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopProductsBarChart;
