
import React, { useState } from 'react';
import { BarChart3, Calendar, Package, Users, TrendingUp, AlertCircle, Plus, FileText, DollarSign, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceManagement from '@/components/ServiceManagement';
import ProfessionalManagement from '@/components/ProfessionalManagement';
import ProductManagement from '@/components/ProductManagement';
import CashFlowManagement from '@/components/CashFlowManagement';
import BannerManagement from '@/components/BannerManagement';
import TimeBlockingManagement from '@/components/TimeBlockingManagement';
import { useScheduling } from '@/hooks/useScheduling';
import { useSharedProducts } from '@/hooks/useSharedProducts';
import { useIsMobile } from '@/hooks/use-mobile';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { appointments } = useScheduling();
  const { products } = useSharedProducts();  
  const isMobile = useIsMobile();

  const dashboardStats = {
    todayAppointments: appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length,
    weekRevenue: 2450.00,
    monthAppointments: 156,
    lowStockItems: products.filter(p => p.stock <= p.minStock).length,
    pendingOrders: 5,
    clientsTotal: 487
  };

  const [orders, setOrders] = useState([
    { id: '#001', client: 'Maria Santos', products: 2, total: 156.80, status: 'Preparando' },
    { id: '#002', client: 'Ana Costa', products: 1, total: 89.90, status: 'Enviado' },
    { id: '#003', client: 'Juliana Silva', products: 3, total: 234.70, status: 'Entregue' },
  ]);

  const [cashFlowEntries, setCashFlowEntries] = useState([]);

  const handleAppointmentStatusChange = (appointmentId: string, newStatus: string) => {
    console.log(`Alterando status do agendamento ${appointmentId} para ${newStatus}`);
  };

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    const order = orders.find(ord => ord.id === orderId);
    if (order && newStatus === 'Entregue') {
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Produto',
        description: `Venda de produtos - Pedido ${order.id}`,
        amount: order.total,
        client: order.client
      };
      setCashFlowEntries(prev => [...prev, newEntry]);
    }
    
    setOrders(orders.map(ord => 
      ord.id === orderId ? { ...ord, status: newStatus } : ord
    ));
  };

  const handleProductStockEntry = (productName: string, quantity: number, unitCost: number) => {
    const totalCost = quantity * unitCost;
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'Produtos',
      description: `Entrada de estoque - ${productName} (${quantity} unidades)`,
      amount: totalCost
    };
    setCashFlowEntries(prev => [...prev, newEntry]);
  };

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-copper/20">
      <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
        {/* Header */}
        <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'} mb-4`}>
            <div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gradient-gold font-playfair`}>
                {isMobile ? 'Admin' : 'Painel Administrativo'}
              </h1>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                {isMobile ? 'Gerencie seu salão' : 'Gerencie seu salão de forma inteligente'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button className={`bg-salon-gold hover:bg-salon-copper text-salon-dark ${isMobile ? 'h-10 px-4 text-sm' : 'h-12 px-6'}`}>
                <Plus className="mr-2" size={16} />
                {isMobile ? 'Novo' : 'Novo Agendamento'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`
            ${isMobile 
              ? 'grid w-full grid-cols-4 glass-card border-salon-gold/30 h-12 overflow-x-auto' 
              : 'grid w-full grid-cols-8 glass-card border-salon-gold/30 h-14'
            }
          `}>
            <TabsTrigger 
              value="dashboard" 
              className={`data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark ${isMobile ? 'text-xs p-2' : 'text-xs'}`}
            >
              {isMobile ? 'Home' : 'Dashboard'}
            </TabsTrigger>
            <TabsTrigger 
              value="banner" 
              className={`data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark ${isMobile ? 'text-xs p-2' : 'text-xs'}`}
            >
              Banner
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className={`data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark ${isMobile ? 'text-xs p-2' : 'text-xs'}`}
            >
              Agenda
            </TabsTrigger>
            <TabsTrigger 
              value="professionals" 
              className={`data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark ${isMobile ? 'text-xs p-2' : 'text-xs'}`}
            >
              {isMobile ? 'Profiss.' : 'Profissionais'}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="services" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-xs">
                  Serviços
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-xs">
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="cashflow" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-xs">
                  Caixa
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-xs">
                  Pedidos
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Mobile additional tabs */}
          {isMobile && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant={activeTab === 'services' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('services')}
                className={`whitespace-nowrap ${activeTab === 'services' ? 'bg-salon-gold text-salon-dark' : 'border-salon-gold/30 text-salon-gold'}`}
              >
                Serviços
              </Button>
              <Button
                variant={activeTab === 'products' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('products')}
                className={`whitespace-nowrap ${activeTab === 'products' ? 'bg-salon-gold text-salon-dark' : 'border-salon-gold/30 text-salon-gold'}`}
              >
                Produtos
              </Button>
              <Button
                variant={activeTab === 'cashflow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('cashflow')}
                className={`whitespace-nowrap ${activeTab === 'cashflow' ? 'bg-salon-gold text-salon-dark' : 'border-salon-gold/30 text-salon-gold'}`}
              >
                Caixa
              </Button>
              <Button
                variant={activeTab === 'orders' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('orders')}
                className={`whitespace-nowrap ${activeTab === 'orders' ? 'bg-salon-gold text-salon-dark' : 'border-salon-gold/30 text-salon-gold'}`}
              >
                Pedidos
              </Button>
            </div>
          )}

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              <Card className="glass-card border-salon-gold/20">
                <CardHeader className={`${isMobile ? 'pb-2' : 'pb-3'}`}>
                  <CardTitle className={`text-salon-gold flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <Calendar size={isMobile ? 14 : 16} />
                    Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'pt-0' : ''}>
                  <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-1`}>
                    {dashboardStats.todayAppointments}
                  </div>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    {isMobile ? 'Agend.' : 'Agendamentos'}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-salon-gold/20">
                <CardHeader className={`${isMobile ? 'pb-2' : 'pb-3'}`}>
                  <CardTitle className={`text-salon-gold flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <TrendingUp size={isMobile ? 14 : 16} />
                    Semana
                  </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'pt-0' : ''}>
                  <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-1`}>
                    R$ {dashboardStats.weekRevenue.toFixed(2)}
                  </div>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    {isMobile ? 'Fatur.' : 'Faturamento'}
                  </p>
                </CardContent>
              </Card>

              <Card className={`glass-card border-salon-gold/20 ${isMobile ? 'col-span-2' : ''}`}>
                <CardHeader className={`${isMobile ? 'pb-2' : 'pb-3'}`}>
                  <CardTitle className={`text-salon-gold flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <Users size={isMobile ? 14 : 16} />
                    Total
                  </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'pt-0' : ''}>
                  <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-1`}>
                    {dashboardStats.clientsTotal}
                  </div>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>Clientes</p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
              <Card className="glass-card border-red-500/30">
                <CardHeader>
                  <CardTitle className={`text-red-400 flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                    <AlertCircle size={isMobile ? 16 : 20} />
                    {isMobile ? 'Alertas Estoque' : 'Alertas de Estoque'}
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <div key={product.id} className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-center'}`}>
                        <div>
                          <p className={`text-white ${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>{product.name}</p>
                          <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                            Restam: {product.stock} | Mín: {product.minStock}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className={`text-red-400 border-red-400 ${isMobile ? 'h-8 w-full' : 'h-10'}`}>
                          Repor
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>
                      {isMobile ? 'Estoque adequado' : 'Todos os produtos estão com estoque adequado'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-salon-gold/20">
                <CardHeader>
                  <CardTitle className={`text-salon-gold flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                    <BarChart3 size={isMobile ? 16 : 20} />
                    {isMobile ? 'Resumo Mês' : 'Resumo do Mês'}
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                  <div className="flex justify-between">
                    <span className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                      {isMobile ? 'Agend.' : 'Agendamentos'}
                    </span>
                    <span className="text-white font-bold">{dashboardStats.monthAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                      {isMobile ? 'Pendentes' : 'Pedidos Pendentes'}
                    </span>
                    <span className="text-salon-gold font-bold">{dashboardStats.pendingOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                      {isMobile ? 'Em Falta' : 'Itens em Falta'}
                    </span>
                    <span className="text-red-400 font-bold">{dashboardStats.lowStockItems}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="banner" className="space-y-6">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <TimeBlockingManagement />
            
            <Card className="glass-card border-salon-gold/20">
              <CardHeader>
                <CardTitle className={`text-salon-gold ${isMobile ? 'text-base' : ''}`}>Agendamentos</CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'} p-4 glass-card rounded-lg`}>
                      <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
                        <div className="text-center">
                          <p className={`text-salon-gold font-bold ${isMobile ? 'text-sm' : ''}`}>{appointment.time}</p>
                          <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>{appointment.date}</p>
                        </div>
                        <div>
                          <p className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>{appointment.clientName}</p>
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Serviços: {appointment.serviceIds.join(', ')}</p>
                          <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-salon-copper`}>Profissional ID: {appointment.professionalId}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-muted-foreground text-center ${isMobile ? 'py-6 text-sm' : 'py-8'}`}>
                    Nenhum agendamento encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professionals" className="space-y-6">
            <ProfessionalManagement />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductManagement onStockEntry={handleProductStockEntry} />
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <CashFlowManagement entries={cashFlowEntries} setEntries={setCashFlowEntries} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="glass-card border-salon-gold/20">
              <CardHeader>
                <CardTitle className={`text-salon-gold flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                  <FileText size={isMobile ? 16 : 20} />
                  {isMobile ? 'Pedidos' : 'Pedidos Recentes'}
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                {orders.map((order, index) => (
                  <div key={index} className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'} p-4 glass-card rounded-lg`}>
                    <div>
                      <p className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>{order.id} - {order.client}</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {order.products} {order.products === 1 ? 'produto' : 'produtos'}
                      </p>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-2'}`}>
                      <div className={`${isMobile ? 'text-left' : 'text-right'}`}>
                        <p className={`text-salon-gold font-bold ${isMobile ? 'text-sm' : ''}`}>R$ {order.total.toFixed(2)}</p>
                        <span className={`${isMobile ? 'text-xs' : 'text-xs'} px-2 py-1 rounded-full ${
                          order.status === 'Entregue' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'Enviado' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      {order.status !== 'Entregue' && (
                        <Button
                          size="sm"
                          onClick={() => handleOrderStatusChange(order.id, 'Entregue')}
                          className={`bg-salon-gold hover:bg-salon-copper text-salon-dark ${isMobile ? 'h-8 text-xs' : 'h-8'}`}
                        >
                          Entregar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
