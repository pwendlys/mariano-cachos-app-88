
import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSharedCart } from '@/hooks/useSharedCart';
import { useCoupons } from '@/hooks/useCoupons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import CouponInput from '@/components/CouponInput';
import PIXPaymentFormModal from '@/components/PIXPaymentFormModal';
import PaymentDeliveryModal from '@/components/PaymentDeliveryModal';
import { useSupabaseSales } from '@/hooks/useSupabaseSales';
import { useAbacatePayment } from '@/hooks/useAbacatePayment';

const SupabaseCart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useSharedCart();
  const { createSale, loading: saleLoading } = useSupabaseSales();
  const { appliedCoupon, calculateDiscount, removeCoupon } = useCoupons();
  const { loading: pixLoading } = useAbacatePayment();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showPixModal, setShowPixModal] = useState(false);
  const [showPaymentDeliveryModal, setShowPaymentDeliveryModal] = useState(false);

  const totalPrice = getTotalPrice();
  const discountAmount = calculateDiscount(totalPrice, appliedCoupon);
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  const handleFinalizeSale = async () => {
    // Verificar se há itens no carrinho
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o usuário está logado
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar sua compra.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Abrir modal de escolha de pagamento e entrega
    setShowPaymentDeliveryModal(true);
  };

  const handlePixPayment = () => {
    // Usar o fluxo antigo do PIX (direto)
    setShowPixModal(true);
  };

  const handleOrderCreated = () => {
    // Limpar carrinho e cupom após criar pedido
    clearCart();
    removeCoupon();
    // Redirecionar para a loja
    navigate('/loja');
  };

  const handlePaymentConfirmed = async (pixKey: string, qrCodeData?: string, transactionId?: string): Promise<boolean> => {
    try {
      console.log('Confirmando pagamento para usuário:', user?.email);
      
      await createSale(
        cart, 
        'pix', 
        discountAmount, 
        appliedCoupon?.id,
        undefined, // profissional_id
        {
          chave_pix: pixKey,
          chave_pix_abacate: pixKey,
          qr_code_data: qrCodeData,
          transaction_id: transactionId
        }
      );
      
      clearCart();
      removeCoupon();
      setShowPixModal(false);
      
      toast({
        title: "Compra finalizada! 🎉",
        description: "Pagamento confirmado e compra processada com sucesso.",
      });
      
      navigate('/loja');
      return true;
    } catch (error) {
      console.error('Erro ao finalizar compra após pagamento:', error);
      toast({
        title: "Erro no processamento",
        description: "Houve um erro ao processar sua compra. Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
      return false;
    }
  };

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
          Finalizar Compra
        </h1>
        <p className="text-muted-foreground">
          {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
        </p>
        {user && (
          <p className="text-salon-gold text-sm mt-2">
            Logado como: {user.nome}
          </p>
        )}
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

      {/* Coupon Input */}
      <CouponInput
        totalCompra={totalPrice}
        appliedCoupon={appliedCoupon}
        onCouponApply={() => {}} // Handled internally by the hook
      />

      {/* Summary */}
      <Card className="glass-card border-salon-gold/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Subtotal:</span>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </div>
            
            {appliedCoupon && discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Desconto ({appliedCoupon.codigo}):</span>
                <span>- R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-salon-gold/20 pt-2">
              <div className="flex justify-between text-salon-gold font-bold text-lg">
                <span>Total:</span>
                <span>R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3 pb-24">
        <Button
          onClick={handleFinalizeSale}
          disabled={saleLoading || pixLoading}
          className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-bold h-14 text-lg"
        >
          {(saleLoading || pixLoading) ? (
            <div className="animate-spin w-5 h-5 border-2 border-salon-dark border-t-transparent rounded-full mr-2" />
          ) : (
            <Receipt className="mr-2" size={20} />
          )}
          {(saleLoading || pixLoading) ? 'Processando...' : 'Escolher Pagamento e Entrega'}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/loja')}
          className="w-full border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
        >
          Continuar Comprando
        </Button>
      </div>

      {/* Payment & Delivery Modal */}
      <PaymentDeliveryModal
        isOpen={showPaymentDeliveryModal}
        onClose={() => setShowPaymentDeliveryModal(false)}
        cartItems={cart}
        totalAmount={totalPrice}
        discountAmount={discountAmount}
        finalTotal={finalTotal}
        appliedCoupon={appliedCoupon}
        onPixPayment={handlePixPayment}
        onOrderCreated={handleOrderCreated}
      />

      {/* PIX Payment Form Modal */}
      <PIXPaymentFormModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        amount={finalTotal}
        description={`Compra de ${getTotalItems()} ${getTotalItems() === 1 ? 'item' : 'itens'}`}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    </div>
  );
};

export default SupabaseCart;
