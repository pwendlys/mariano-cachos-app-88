
import React from 'react';
import { Home, Calendar, Package, ShoppingCart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSharedCart } from '@/hooks/useSharedCart';
import CartIcon from '@/components/CartIcon';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useSharedCart();

  const navItems = [
    {
      icon: Home,
      label: 'Início',
      path: '/',
      onClick: () => navigate('/')
    },
    {
      icon: Calendar,
      label: 'Agendar',
      path: '/agendamento',
      onClick: () => navigate('/agendamento')
    },
    {
      icon: Package,
      label: 'Produtos',
      path: '/loja',
      onClick: () => navigate('/loja')
    },
    {
      icon: ShoppingCart,
      label: 'Carrinho',
      path: '/carrinho',
      onClick: () => navigate('/carrinho'),
      isCart: true
    },
    {
      icon: User,
      label: 'Perfil',
      path: '/perfil',
      onClick: () => navigate('/perfil')
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-salon-dark/95 backdrop-blur-md border-t border-salon-gold/20 z-50">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={item.onClick}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-salon-gold bg-salon-gold/10'
                  : 'text-gray-400 hover:text-salon-gold hover:bg-salon-gold/5'
              }`}
            >
              {item.isCart ? (
                <CartIcon itemCount={getTotalItems()} size="sm" />
              ) : (
                <Icon size={20} />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
