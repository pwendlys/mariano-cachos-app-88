
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CartIconProps {
  itemCount?: number;
}

const CartIcon = ({ itemCount = 0 }: CartIconProps) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="relative text-salon-gold hover:bg-salon-gold/10 h-12 w-12"
      onClick={() => navigate('/carrinho')}
    >
      <ShoppingCart size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
          {itemCount}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
