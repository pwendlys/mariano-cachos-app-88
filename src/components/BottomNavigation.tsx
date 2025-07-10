
import React from 'react';
import { Home, Calendar, ShoppingBag, User, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock cart count
  const cartItemCount = 3;

  const tabs = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    { id: 'schedule', label: 'Agendar', icon: Calendar, path: '/agendamento' },
    { id: 'store', label: 'Produtos', icon: ShoppingBag, path: '/loja' },
    { id: 'cart', label: 'Carrinho', icon: ShoppingCart, path: '/carrinho', count: cartItemCount },
    { id: 'profile', label: 'Perfil', icon: User, path: '/perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card mx-4 mb-4 rounded-2xl">
      <div className="flex items-center justify-around py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive 
                  ? 'text-salon-gold bg-salon-gold/10' 
                  : 'text-muted-foreground hover:text-salon-gold'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {tab.count && tab.count > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
