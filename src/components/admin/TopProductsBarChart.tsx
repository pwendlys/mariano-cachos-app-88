
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
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
    nome: product.nome.length > 12 ? product.nome.substring(0, 12) + '...' : product.nome,
    vendas: product.vendas,
    fullName: product.nome
  }));

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
        <CardTitle className="text-salon-gold">Top Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--salon-gold))" opacity={0.1} />
              <XAxis 
                dataKey="nome"
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="hsl(var(--salon-gold))"
                tick={{ fill: 'hsl(var(--salon-gold))' }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(label, payload) => {
                  const item = data.find(d => d.nome === label);
                  return item?.fullName || label;
                }}
                formatter={(value: number) => [`${value} unidades`]}
              />
              <Bar
                dataKey="vendas"
                fill="hsl(var(--salon-gold))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopProductsBarChart;
