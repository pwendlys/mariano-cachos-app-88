
import React from 'react';
import { Home, Calendar, ShoppingBag, User, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Mock cart count
  const cartItemCount = 3;

  const tabs = [
    { id: 'home', label: 'Início', shortLabel: 'Home', icon: Home, path: '/' },
    { id: 'schedule', label: 'Agendar', shortLabel: 'Agenda', icon: Calendar, path: '/agendamento' },
    { id: 'store', label: 'Produtos', shortLabel: 'Loja', icon: ShoppingBag, path: '/loja' },
    { id: 'cart', label: 'Carrinho', shortLabel: 'Cart', icon: ShoppingCart, path: '/carrinho', count: cartItemCount },
    { id: 'profile', label: 'Perfil', shortLabel: 'Perfil', icon: User, path: '/perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card mx-2 sm:mx-4 mb-2 sm:mb-4 rounded-xl sm:rounded-2xl safe-area-pb">
      <div className="flex items-center justify-around py-2 sm:py-3 md:py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const iconSize = isMobile ? 18 : 22;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center space-y-1 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[60px] ${
                isActive 
                  ? 'text-salon-gold bg-salon-gold/10' 
                  : 'text-muted-foreground hover:text-salon-gold active:bg-salon-gold/5'
              }`}
            >
              <div className="relative">
                <Icon size={iconSize} />
                {tab.count && tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full text-[8px] sm:text-[10px] flex items-center justify-center text-white font-bold">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${isMobile ? 'leading-tight' : ''}`}>
                {isMobile && tab.shortLabel ? tab.shortLabel : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
