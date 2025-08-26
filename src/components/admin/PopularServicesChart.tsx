
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { AdvancedDashboardMetrics } from '@/hooks/useAdvancedDashboardMetrics';

interface PopularServicesChartProps {
  popularServices: AdvancedDashboardMetrics['popularServices'];
}

const PopularServicesChart = ({ popularServices }: PopularServicesChartProps) => {
  const colors = [
    'hsl(var(--salon-gold))',
    'hsl(142, 76%, 36%)',
    'hsl(221, 83%, 53%)',
    'hsl(262, 83%, 58%)',
    'hsl(346, 87%, 43%)'
  ];

  const chartConfig = {
    appointments: {
      label: "Agendamentos",
      color: "hsl(var(--salon-gold))",
    }
  };

  const data = popularServices.map((service, index) => ({
    name: service.nome,
    value: service.total_appointments,
    color: colors[index % colors.length]
  }));

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold">Serviços Mais Populares</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend 
                wrapperStyle={{ color: 'hsl(var(--salon-gold))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PopularServicesChart;
