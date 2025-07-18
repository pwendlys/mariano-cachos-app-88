
import React from 'react';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSharedCart } from '@/hooks/useSharedCart';

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useSharedCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
    toast({
      title: "Quantidade atualizada",
      description: "Item atualizado no carrinho",
    });
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeFromCart(id);
    toast({
      title: "Item removido",
      description: `${name} removido do carrinho`,
    });
  };

  const handleCheckout = () => {
    // Redirecionar para o carrinho do Supabase que tem a funcionalidade completa de finalização
    navigate('/carrinho');
  };

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-salon-gold hover:bg-salon-gold/10 h-12 w-12"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-gradient-gold font-playfair">
          Meu Carrinho
        </h1>
        <div className="w-12" />
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCartIcon size={64} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground mb-6">Adicione produtos à sua compra para continuar</p>
          <Button 
            onClick={() => navigate('/loja')}
            className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-bold"
          >
            Ir às Compras
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="glass-card border-salon-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-salon-gold/20 to-salon-copper/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🧴</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                      <p className="text-xs text-salon-copper">{item.brand}</p>
                      <p className="text-salon-gold font-bold">R$ {item.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-400 hover:bg-red-400/10 h-8 w-8"
                      >
                        <Trash2 size={16} />
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-8 w-8 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </Button>
                        
                        <span className="text-white font-medium px-2 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-8 w-8 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total and Checkout */}
          <div className="sticky bottom-24 space-y-4">
            <Card className="glass-card border-salon-gold/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-xl font-bold text-salon-gold">
                    R$ {getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={handleCheckout}
                className="w-full h-14 bg-gradient-to-r from-salon-gold to-salon-copper hover:from-salon-copper hover:to-salon-gold text-salon-dark font-bold text-lg rounded-2xl"
              >
                Finalizar Compra
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/loja')}
                className="w-full h-12 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 rounded-2xl"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
