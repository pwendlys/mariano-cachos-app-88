
import React from 'react';
import { User, Calendar, ShoppingBag, Star, Settings, LogOut, Gift, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
  const userStats = {
    appointmentsTotal: 12,
    appointmentsNext: 2,
    purchasesTotal: 8,
    loyaltyPoints: 250,
    memberSince: '2023'
  };

  const recentAppointments = [
    { date: '15/12/2024', service: 'Hidratação Profunda', professional: 'Marcos Mariano', status: 'Concluído' },
    { date: '28/11/2024', service: 'Corte + Finalização', professional: 'Ana Silva', status: 'Concluído' },
    { date: '10/11/2024', service: 'Coloração Natural', professional: 'Marcos Mariano', status: 'Concluído' },
  ];

  const recentPurchases = [
    { date: '20/12/2024', product: 'Shampoo Hidratante', price: 'R$ 89,90' },
    { date: '15/12/2024', product: 'Máscara Nutritiva', price: 'R$ 156,90' },
    { date: '05/12/2024', product: 'Óleo Finalizador', price: 'R$ 67,90' },
  ];

  return (
    <div className="px-4 space-y-6 animate-fade-in pb-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e acompanhe seu histórico
        </p>
      </div>

      {/* User Info */}
      <Card className="glass-card border-salon-gold/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center">
              <User className="text-salon-dark" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">Maria Silva</h2>
              <p className="text-salon-gold">maria.silva@email.com</p>
              <p className="text-sm text-muted-foreground">Membro desde {userStats.memberSince}</p>
            </div>
            <Button variant="outline" size="icon" className="border-salon-gold text-salon-gold hover:bg-salon-gold/10">
              <Settings size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-salon-gold/20 text-center">
          <CardContent className="p-4">
            <Calendar className="mx-auto text-salon-gold mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{userStats.appointmentsTotal}</p>
            <p className="text-xs text-muted-foreground">Agendamentos Totais</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-salon-gold/20 text-center">
          <CardContent className="p-4">
            <ShoppingBag className="mx-auto text-salon-gold mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{userStats.purchasesTotal}</p>
            <p className="text-xs text-muted-foreground">Compras Realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Program */}
      <Card className="glass-card border-salon-purple/30 bg-gradient-to-r from-salon-purple/10 to-salon-gold/10">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Gift size={20} />
            Programa de Fidelidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pontos acumulados</span>
              <span className="text-salon-gold font-bold">{userStats.loyaltyPoints} pts</span>
            </div>
            <div className="w-full bg-salon-dark rounded-full h-2">
              <div 
                className="gradient-gold h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(userStats.loyaltyPoints / 500) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Faltam {500 - userStats.loyaltyPoints} pontos para o próximo brinde!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Clock size={20} />
            Últimos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAppointments.map((appointment, index) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{appointment.service}</p>
                  <p className="text-sm text-salon-copper">{appointment.professional}</p>
                  <p className="text-xs text-muted-foreground">{appointment.date}</p>
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  {appointment.status}
                </span>
              </div>
              {index < recentAppointments.length - 1 && <Separator className="my-3 bg-salon-gold/20" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <ShoppingBag size={20} />
            Últimas Compras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPurchases.map((purchase, index) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{purchase.product}</p>
                  <p className="text-xs text-muted-foreground">{purchase.date}</p>
                </div>
                <span className="text-salon-gold font-bold">{purchase.price}</span>
              </div>
              {index < recentPurchases.length - 1 && <Separator className="my-3 bg-salon-gold/20" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full border-salon-gold text-salon-gold hover:bg-salon-gold/10 h-12"
        >
          <Star className="mr-2" size={20} />
          Avaliar Último Atendimento
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-red-500 text-red-400 hover:bg-red-500/10 h-12"
        >
          <LogOut className="mr-2" size={20} />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};

export default Profile;
