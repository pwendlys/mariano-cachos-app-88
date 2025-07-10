
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSharedCart } from '@/hooks/useSharedCart';

const CartIcon = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useSharedCart();
  const itemCount = getTotalItems();

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="relative text-salon-gold hover:bg-salon-gold/10 h-12 w-12"
      onClick={() => navigate('/carrinho')}
    >
      <ShoppingCart size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
