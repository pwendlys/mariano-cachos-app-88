
import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCoupons, Coupon } from '@/hooks/useCoupons';

interface CouponInputProps {
  totalCompra: number;
  appliedCoupon: Coupon | null;
  onCouponApply: (coupon: Coupon | null) => void;
}

const CouponInput = ({ totalCompra, appliedCoupon, onCouponApply }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const { loading, applyCoupon, removeCoupon } = useCoupons();

  const handleApplyCoupon = async () => {
    const coupon = await applyCoupon(couponCode, totalCompra);
    if (coupon) {
      onCouponApply(coupon);
      setCouponCode('');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    onCouponApply(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <Card className="glass-card border-salon-gold/20">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-salon-gold">
            <Tag size={20} />
            <Label className="text-white font-semibold">Cupom de Desconto</Label>
          </div>

          {appliedCoupon ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-semibold">{appliedCoupon.codigo}</p>
                  {appliedCoupon.descricao && (
                    <p className="text-sm text-green-300">{appliedCoupon.descricao}</p>
                  )}
                  <p className="text-xs text-green-200">
                    {appliedCoupon.tipo === 'percentual' 
                      ? `${appliedCoupon.valor}% de desconto`
                      : `R$ ${appliedCoupon.valor.toFixed(2)} de desconto`
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveCoupon}
                  className="text-red-400 hover:bg-red-500/20 h-8 w-8"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Digite o código do cupom"
                className="glass-card border-salon-gold/30 bg-transparent text-white flex-1"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
              >
                {loading ? 'Validando...' : 'Aplicar'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponInput;
