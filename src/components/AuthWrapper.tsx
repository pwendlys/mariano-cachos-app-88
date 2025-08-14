
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { Shield, User } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, signInAsAdmin } = useAuthCheck();

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

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return (
      <Card className="glass-card border-salon-gold/20 max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-salon-gold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            Autenticação Necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-salon-copper">
            {requireAdmin 
              ? 'Esta área requer permissões de administrador.'
              : 'Você precisa estar autenticado para acessar esta área.'}
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => signInAsAdmin()}
              className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark"
            >
              <User className="w-4 h-4 mr-2" />
              Entrar como Admin
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Email: admin@example.com | Senha: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
