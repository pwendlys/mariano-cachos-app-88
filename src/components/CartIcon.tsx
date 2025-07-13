
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CartIconProps {
  itemCount: number;
  size?: 'sm' | 'default' | 'lg';
}

const CartIcon = ({ itemCount, size = 'default' }: CartIconProps) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 18,
    default: 20,
    lg: 24
  };

  const badgeSizes = {
    sm: 'w-3 h-3 text-[8px]',
    default: 'w-4 h-4 text-[10px]',
    lg: 'w-5 h-5 text-xs'
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => navigate('/carrinho')}
      className={`relative text-salon-gold hover:bg-salon-gold/10 ${sizeClasses[size]}`}
    >
      <ShoppingCart size={iconSizes[size]} />
      {itemCount > 0 && (
        <span className={`absolute -top-1 -right-1 ${badgeSizes[size]} bg-red-500 rounded-full flex items-center justify-center text-white font-bold`}>
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
