
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import MobileLayout from '@/components/MobileLayout';

const Index: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Bem-vindo(a), {userProfile?.full_name}!
            </h1>
            <p className="text-xl text-muted-foreground">
              {userProfile?.user_type === 'admin' && 'Painel de Administração'}
              {userProfile?.user_type === 'driver' && 'Área do Profissional'}
              {userProfile?.user_type === 'patient' && 'Sua experiência de beleza começa aqui'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {/* Quick Actions based on user type */}
            {userProfile?.user_type === 'patient' && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">Agendar Serviço</h3>
                  <p className="text-muted-foreground mb-4">Reserve seu horário com nossos profissionais</p>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Agendar Agora
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">Loja Virtual</h3>
                  <p className="text-muted-foreground mb-4">Produtos exclusivos para seu cuidado</p>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Ver Produtos
                  </button>
                </div>
              </>
            )}

            {userProfile?.user_type === 'driver' && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">Minha Agenda</h3>
                  <p className="text-muted-foreground mb-4">Visualize seus agendamentos do dia</p>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Ver Agenda
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">Disponibilidade</h3>
                  <p className="text-muted-foreground mb-4">Configure seus horários de trabalho</p>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Configurar
                  </button>
                </div>
              </>
            )}

            {userProfile?.user_type === 'admin' && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">Gerenciar Usuários</h3>
                  <p className="text-muted-foreground mb-4">Administre clientes e funcionários</p>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Gerenciar
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
                  <p className="text-muted-foreground mb-4">Visualize estatísticas e relatórios</p>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-shadow">
                    Ver Relatórios
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">Configurações</h3>
                  <p className="text-muted-foreground mb-4">Configure o sistema do salão</p>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Configurar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <MobileLayout />
    </div>
  );
};

export default Index;
