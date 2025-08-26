
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { DashboardMetrics } from '@/hooks/useDashboardMetrics';

interface AppointmentsStatusChartProps {
  appointmentsByStatus: DashboardMetrics['appointmentsByStatus'];
}

const AppointmentsStatusChart = ({ appointmentsByStatus }: AppointmentsStatusChartProps) => {
  const chartConfig = {
    pendente: {
      label: "Pendente",
      color: "hsl(45, 93%, 47%)",
    },
    confirmado: {
      label: "Confirmado",
      color: "hsl(142, 76%, 36%)",
    },
    concluido: {
      label: "Concluído",
      color: "hsl(221, 83%, 53%)",
    },
    cancelado: {
      label: "Cancelado",
      color: "hsl(0, 84%, 60%)",
    }
  };

  const data = Object.entries(appointmentsByStatus).map(([status, count]) => ({
    name: chartConfig[status as keyof typeof chartConfig].label,
    value: count,
    color: chartConfig[status as keyof typeof chartConfig].color
  }));

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold">Status dos Agendamentos</CardTitle>
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

export default AppointmentsStatusChart;
