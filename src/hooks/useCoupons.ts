
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Coupon {
  id: string;
  codigo: string;
  descricao: string | null;
  tipo: 'percentual' | 'valor_fixo';
  valor: number;
  valor_minimo_compra: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  limite_uso: number | null;
  usos_realizados: number;
}

export const useCoupons = () => {
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const validateCoupon = async (codigo: string, totalCompra: number) => {
    if (!codigo.trim()) {
      toast({
        title: "Código inválido",
        description: "Digite um código de cupom válido.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      
      const { data: coupon, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', codigo.toUpperCase())
        .eq('ativo', true)
        .lte('data_inicio', new Date().toISOString().split('T')[0])
        .gte('data_fim', new Date().toISOString().split('T')[0])
        .single();

      if (error || !coupon) {
        toast({
          title: "Cupom inválido",
          description: "Cupom não encontrado ou expirado.",
          variant: "destructive",
        });
        return null;
      }

      // Verificar valor mínimo
      if (totalCompra < coupon.valor_minimo_compra) {
        toast({
          title: "Valor mínimo não atingido",
          description: `Valor mínimo para este cupom: R$ ${coupon.valor_minimo_compra.toFixed(2)}`,
          variant: "destructive",
        });
        return null;
      }

      // Verificar limite de uso
      if (coupon.limite_uso && coupon.usos_realizados >= coupon.limite_uso) {
        toast({
          title: "Cupom esgotado",
          description: "Este cupom já atingiu o limite de uso.",
          variant: "destructive",
        });
        return null;
      }

      return coupon;
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar cupom. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (codigo: string, totalCompra: number) => {
    const coupon = await validateCoupon(codigo, totalCompra);
    if (coupon) {
      setAppliedCoupon(coupon);
      toast({
        title: "Cupom aplicado! 🎉",
        description: `${coupon.descricao || `Cupom ${coupon.codigo}`} aplicado com sucesso.`,
      });
    }
    return coupon;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Cupom removido",
      description: "Cupom foi removido do carrinho.",
    });
  };

  const calculateDiscount = (totalCompra: number, coupon: Coupon | null) => {
    if (!coupon) return 0;
    
    if (coupon.tipo === 'percentual') {
      return (totalCompra * coupon.valor) / 100;
    } else {
      return coupon.valor;
    }
  };

  return {
    loading,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };
};
