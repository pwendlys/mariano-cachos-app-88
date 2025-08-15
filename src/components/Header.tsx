
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import CartIcon from './CartIcon';
import NotificationsDropdown from './NotificationsDropdown';
import ClientAvatar from './ClientAvatar';
import { Settings, LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="glass-card border-b border-salon-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full ring-2 ring-salon-gold flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/lovable-uploads/2c7426a6-ccbe-478a-95f7-439af5d69582.png" 
                alt="Marcos Mariano Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-salon-gold">Marcos Mariano</h1>
          </Link>

          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            
            {user && (user.tipo === 'admin' || user.tipo === 'convidado') && (
              <Link to="/admin">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {user.tipo === 'admin' ? 'Administração' : 'Painel'}
                </Button>
              </Link>
            )}
            
            <CartIcon itemCount={0} />
            
            <div className="flex items-center space-x-3">
              <ClientAvatar 
                avatar_url={user?.avatar_url} 
                nome={user?.nome || 'Usuário'} 
              />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <span className="text-salon-gold font-medium">{user?.nome}</span>
                  <Badge 
                    variant={user?.tipo === 'admin' ? 'default' : 'secondary'}
                    className={
                      user?.tipo === 'admin' 
                        ? 'bg-salon-gold text-salon-dark'
                        : user?.tipo === 'convidado'
                        ? 'bg-salon-copper/20 text-salon-copper'
                        : 'bg-salon-gold/20 text-salon-gold'
                    }
                  >
                    {user?.tipo === 'admin' ? 'Admin' : user?.tipo === 'convidado' ? 'Convidado' : 'Cliente'}
                  </Badge>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-salon-copper hover:text-salon-gold hover:bg-salon-gold/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
