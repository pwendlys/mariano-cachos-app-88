
import React from 'react';
import { Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CartIcon from './CartIcon';
import { useBannerSettings } from '@/hooks/useBannerSettings';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bannerSettings } = useBannerSettings();

  // Mock cart count - in real app this would come from state/context
  const cartItemCount = 3;

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
      default:
        return 'Marcos Mariano';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
            {bannerSettings.logo ? (
              <img 
                src={bannerSettings.logo} 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-full"
              />
            ) : (
              <span className="text-salon-dark font-bold text-lg font-playfair">MM</span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gradient-gold font-playfair">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-muted-foreground">Hair Stylist</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative text-salon-gold hover:bg-salon-gold/10 h-12 w-12"
          >
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
              2
            </span>
          </Button>
          
          <CartIcon itemCount={cartItemCount} />
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-salon-gold hover:bg-salon-gold/10 h-12 w-12"
            onClick={() => navigate('/perfil')}
          >
            <User size={24} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
