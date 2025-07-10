
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Calendar, Star, Clock } from 'lucide-react';

interface EmployeeProfile {
  id: string;
  user_id: string;
  specialties: string[];
  commission_rate: number;
  work_schedule: any;
  work_days: number[];
  monthly_goal: number;
  is_active: boolean;
}

interface ClientProfile {
  id: string;
  user_id: string;
  address: string | null;
  birth_date: string | null;
  preferences: any;
  loyalty_points: number;
  total_spent: number;
  last_visit: string | null;
}

export const UserProfile: React.FC = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const { toast } = useToast();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [commissionRate, setCommissionRate] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(0);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile && user) {
      fetchSpecificProfile();
    }
  }, [userProfile, user]);

  const fetchSpecificProfile = async () => {
    if (!user || !userProfile) return;

    try {
      if (userProfile.user_type === 'funcionario') {
        const { data, error } = await supabase
          .from('employee_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setEmployeeProfile(data);
        
        if (data) {
          setSpecialties(data.specialties?.join(', ') || '');
          setCommissionRate(data.commission_rate || 0);
          setMonthlyGoal(data.monthly_goal || 0);
        }
      } else if (userProfile.user_type === 'cliente') {
        const { data, error } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setClientProfile(data);
        
        if (data) {
          setAddress(data.address || '');
        }
      }
    } catch (error) {
      console.error('Error fetching specific profile:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    setLoading(true);
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update specific profile based on user type
      if (userProfile.user_type === 'funcionario') {
        const employeeData = {
          specialties: specialties.split(',').map(s => s.trim()).filter(s => s),
          commission_rate: commissionRate,
          monthly_goal: monthlyGoal,
        };

        if (employeeProfile) {
          const { error } = await supabase
            .from('employee_profiles')
            .update(employeeData)
            .eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('employee_profiles')
            .insert([{ ...employeeData, user_id: user.id }]);
          if (error) throw error;
        }
      } else if (userProfile.user_type === 'cliente') {
        const clientData = {
          address: address,
        };

        if (clientProfile) {
          const { error } = await supabase
            .from('client_profiles')
            .update(clientData)
            .eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('client_profiles')
            .insert([{ ...clientData, user_id: user.id }]);
          if (error) throw error;
        }
      }

      await refreshProfile();
      toast({
        title: "Perfil atualizado! ✨",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <div>Carregando perfil...</div>;
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'admin': return 'Administrador';
      case 'funcionario': return 'Funcionário';
      case 'cliente': return 'Cliente';
      default: return type;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'funcionario': return 'bg-blue-100 text-blue-800';
      case 'cliente': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{userProfile.full_name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className={`mt-2 ${getUserTypeColor(userProfile.user_type)}`}>
                  {getUserTypeLabel(userProfile.user_type)}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={userProfile.is_active ? "default" : "secondary"}>
                  {userProfile.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email verificado:</span>
                <Badge variant={userProfile.email_verified ? "default" : "secondary"}>
                  {userProfile.email_verified ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Telefone verificado:</span>
                <Badge variant={userProfile.phone_verified ? "default" : "secondary"}>
                  {userProfile.phone_verified ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>

            {/* Client specific info */}
            {userProfile.user_type === 'cliente' && clientProfile && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Star className="h-4 w-4" />
                  Informações do Cliente
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pontos de fidelidade:</span>
                  <span className="text-sm font-medium">{clientProfile.loyalty_points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total gasto:</span>
                  <span className="text-sm font-medium">R$ {clientProfile.total_spent}</span>
                </div>
                {clientProfile.last_visit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Última visita:</span>
                    <span className="text-sm font-medium">
                      {new Date(clientProfile.last_visit).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Employee specific info */}
            {userProfile.user_type === 'funcionario' && employeeProfile && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Informações do Funcionário
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de comissão:</span>
                  <span className="text-sm font-medium">{employeeProfile.commission_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Meta mensal:</span>
                  <span className="text-sm font-medium">R$ {employeeProfile.monthly_goal}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Client specific fields */}
              {userProfile.user_type === 'cliente' && (
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Seu endereço completo"
                  />
                </div>
              )}

              {/* Employee specific fields */}
              {userProfile.user_type === 'funcionario' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialties">Especialidades</Label>
                    <Input
                      id="specialties"
                      value={specialties}
                      onChange={(e) => setSpecialties(e.target.value)}
                      placeholder="Corte, Coloração, Tratamentos (separado por vírgula)"
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="commissionRate">Taxa de Comissão (%)</Label>
                      <Input
                        id="commissionRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monthlyGoal">Meta Mensal (R$)</Label>
                      <Input
                        id="monthlyGoal"
                        type="number"
                        min="0"
                        step="0.01"
                        value={monthlyGoal}
                        onChange={(e) => setMonthlyGoal(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
