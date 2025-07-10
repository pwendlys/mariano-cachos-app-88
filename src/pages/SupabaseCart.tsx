
import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, DollarSign, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSharedCart } from '@/hooks/useSharedCart';
import { useSupabaseSales } from '@/hooks/useSupabaseSales';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SupabaseCart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useSharedCart();
  const { createSale, loading } = useSupabaseSales();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Forma de pagamento obrigatória",
        description: "Selecione uma forma de pagamento para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSale(cart, paymentMethod, discount);
      clearCart();
      navigate('/loja');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
    }
  };

  const totalWithDiscount = getTotalPrice() - discount;

  if (cart.length === 0) {
    return (
      <div className="px-4 py-8 text-center animate-fade-in">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mb-6">Adicione produtos à sua compra para continuar</p>
        <Button 
          onClick={() => navigate('/loja')}
          className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
        >
          Ir às Compras
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
          Finalizar Venda
        </h1>
        <p className="text-muted-foreground">
          {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
        </p>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cart.map((item) => (
          <Card key={item.id} className="glass-card border-salon-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-salon-gold/20 to-salon-copper/20 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🧴</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{item.name}</h3>
                  <p className="text-sm text-salon-copper">{item.brand}</p>
                  <p className="text-salon-gold font-bold">R$ {item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-salon-gold hover:bg-salon-gold/20"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </Button>
                  
                  <span className="text-white font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-salon-gold hover:bg-salon-gold/20"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:bg-red-500/20"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="mt-2 pt-2 border-t border-salon-gold/20">
                <p className="text-right text-white font-semibold">
                  Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Details */}
      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <CreditCard size={20} />
            Detalhes do Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-white">Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="glass-card border-salon-gold/30 text-white">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount" className="text-white">Desconto (R$)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="glass-card border-salon-gold/30 bg-transparent text-white"
              placeholder="0,00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="glass-card border-salon-gold/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Subtotal:</span>
              <span>R$ {getTotalPrice().toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Desconto:</span>
                <span>- R$ {discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-salon-gold/20 pt-2">
              <div className="flex justify-between text-salon-gold font-bold text-lg">
                <span>Total Final:</span>
                <span>R$ {Math.max(0, totalWithDiscount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3 pb-24">
        <Button
          onClick={handleFinalizeSale}
          disabled={loading || totalWithDiscount < 0}
          className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-bold h-14 text-lg"
        >
          {loading ? (
            <div className="animate-spin w-5 h-5 border-2 border-salon-dark border-t-transparent rounded-full mr-2" />
          ) : (
            <Receipt className="mr-2" size={20} />
          )}
          {loading ? 'Processando...' : `Finalizar Venda - R$ ${Math.max(0, totalWithDiscount).toFixed(2)}`}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/loja')}
          className="w-full border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
        >
          Continuar Comprando
        </Button>
      </div>
    </div>
  );
};

export default SupabaseCart;
