
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUp, DollarSign, Users, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useSupabaseCashFlow } from '@/hooks/useSupabaseCashFlow';
import type { DateRange } from 'react-day-picker';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [filterType, setFilterType] = useState<'month' | 'week' | 'custom'>('month');
  const { entries, loading } = useSupabaseCashFlow();

  // Mock data for charts - replace with real data from your hooks
  const revenueData = [
    { name: 'Jan', receitas: 4000, despesas: 2400 },
    { name: 'Fev', receitas: 3000, despesas: 1398 },
    { name: 'Mar', receitas: 2000, despesas: 9800 },
    { name: 'Abr', receitas: 2780, despesas: 3908 },
    { name: 'Mai', receitas: 1890, despesas: 4800 },
    { name: 'Jun', receitas: 2390, despesas: 3800 },
  ];

  const serviceData = [
    { name: 'Corte', value: 400, color: '#D4AF37' },
    { name: 'Coloração', value: 300, color: '#B8860B' },
    { name: 'Escova', value: 200, color: '#DAA520' },
    { name: 'Outros', value: 100, color: '#F4A460' },
  ];

  const productData = [
    { name: 'Shampoo', vendas: 120 },
    { name: 'Condicionador', vendas: 98 },
    { name: 'Máscara', vendas: 86 },
    { name: 'Óleo', vendas: 74 },
    { name: 'Spray', vendas: 62 },
  ];

  // Calculate summary stats
  const totalReceitas = entries
    .filter(entry => entry.tipo === 'entrada')
    .reduce((sum, entry) => sum + entry.valor, 0);
  
  const totalDespesas = entries
    .filter(entry => entry.tipo === 'saida')
    .reduce((sum, entry) => sum + entry.valor, 0);

  const chartConfig = {
    receitas: { label: 'Receitas', color: '#D4AF37' },
    despesas: { label: 'Despesas', color: '#B8860B' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold font-playfair">Dashboard</h1>
          <p className="text-salon-copper">Visão geral do seu negócio</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filterType} onValueChange={(value: 'month' | 'week' | 'custom') => setFilterType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="custom">Período customizado</SelectItem>
            </SelectContent>
          </Select>
          
          {filterType === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione as datas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-salon-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-salon-copper">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-salon-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-gold">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-salon-copper">Total Despesas</CardTitle>
            <DollarSign className="h-4 w-4 text-salon-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-gold">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">-4.3% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-salon-copper">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-salon-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-gold">
              R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">+12.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-salon-copper">Atendimentos</CardTitle>
            <Users className="h-4 w-4 text-salon-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-gold">142</div>
            <p className="text-xs text-muted-foreground">+8.2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-gradient-gold">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="var(--color-receitas)" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="var(--color-despesas)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-gradient-gold">Serviços Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-salon-gold/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gradient-gold">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="vendas" fill="#D4AF37" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
