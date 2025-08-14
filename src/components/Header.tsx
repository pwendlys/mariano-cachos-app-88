
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CartIcon from './CartIcon';
import NotificationsDropdown from './NotificationsDropdown';
import { useBannerSettings } from '@/hooks/useBannerSettings';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRealtimeCart } from '@/hooks/useRealtimeCart';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bannerSettings } = useBannerSettings();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const { getTotalItems } = useRealtimeCart();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Marcos Mariano';
      case '/agendamento':
        return 'Agendamento';
      case '/loja':
        return 'Produtos';
      case '/carrinho':
        return 'Carrinho';
      case '/perfil':
        return 'Perfil';
      case '/admin':
        return 'Administração';
      default:
        return 'Marcos Mariano';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-xl sm:rounded-2xl">
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 rounded-full border-2 border-salon-gold bg-salon-dark flex items-center justify-center flex-shrink-0 p-0.5">
            {bannerSettings.logo ? (
              <img 
                src={bannerSettings.logo} 
                alt="Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            ) : (
              <img 
                src="/lovable-uploads/6c513fb2-7005-451a-bfba-cb471f2086a3.png" 
                alt="Marcos Mariano Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gradient-gold font-playfair truncate">
              {isMobile && getPageTitle().length > 15 ? getPageTitle().substring(0, 15) + '...' : getPageTitle()}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Hair Stylist</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          <NotificationsDropdown size={isMobile ? 'sm' : 'default'} />
          
          <CartIcon itemCount={getTotalItems()} size={isMobile ? 'sm' : 'default'} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-salon-gold hover:bg-salon-gold/10 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
              >
                <User size={isMobile ? 18 : 20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{user?.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <p className="text-xs text-salon-gold capitalize">{user?.tipo}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              {user?.tipo === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <User className="mr-2 h-4 w-4" />
                  Administração
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
