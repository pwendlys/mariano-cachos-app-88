
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
}

const CartSummary = ({ totalItems, totalPrice }: CartSummaryProps) => {
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-salon-gold font-medium">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'} no carrinho
          </p>
          <p className="text-white text-sm">
            Total: R$ {totalPrice.toFixed(2)}
          </p>
        </div>
        <Button 
          className="bg-salon-gold hover:bg-salon-copper text-salon-dark h-12"
          onClick={() => navigate('/carrinho')}
        >
          Ver Carrinho
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
