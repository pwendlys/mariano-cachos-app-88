
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [timeout, setTimeout] = useState(false);

  // Timeout para evitar loading infinito
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTimeout(true);
    }, 10000); // 10 segundos timeout

    return () => clearTimeout(timer);
  }, []);

  if (loading && !timeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-copper/20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-salon-dark font-bold text-2xl font-playfair">MM</span>
          </div>
          <p className="text-salon-gold">Carregando...</p>
          <p className="text-salon-copper text-sm mt-2">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se houve timeout ou não há usuário, redirecionar para auth
  if (timeout || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se requer admin e o usuário não é admin, redirecionar para home
  if (requireAdmin && user.tipo !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
