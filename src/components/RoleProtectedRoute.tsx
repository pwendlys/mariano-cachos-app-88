
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('cliente' | 'admin' | 'convidado')[];
  requireAuth?: boolean;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['cliente', 'admin', 'convidado'],
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salon-gold mx-auto mb-4"></div>
          <p className="text-salon-copper">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !allowedRoles.includes(user.tipo)) {
    return (
      <Card className="glass-card border-salon-gold/20 max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-salon-gold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-salon-copper">
            Você não tem permissão para acessar esta área.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
