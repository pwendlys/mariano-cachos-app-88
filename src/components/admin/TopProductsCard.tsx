
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import type { DashboardMetrics } from '@/hooks/useDashboardMetrics';

interface TopProductsCardProps {
  products: DashboardMetrics['topProducts'];
}

const TopProductsCard = ({ products }: TopProductsCardProps) => {
  return (
    <Card className="glass-card border-salon-gold/20">
      <CardHeader>
        <CardTitle className="text-salon-gold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-salon-dark/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-salon-gold font-medium">#{index + 1}</span>
                  <h4 className="font-medium text-white">{product.nome}</h4>
                </div>
                <p className="text-sm text-gray-400">{product.categoria}</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-salon-gold/20 text-salon-gold">
                  {product.vendas} vendas
                </Badge>
                <p className="text-xs text-gray-400 mt-1">
                  Estoque: {product.estoque}
                </p>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-center text-gray-400 py-4">
              Nenhum produto encontrado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsCard;
