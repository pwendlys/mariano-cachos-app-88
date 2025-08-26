
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { DashboardMetrics } from '@/hooks/useDashboardMetrics';

interface LowStockAlertProps {
  products: DashboardMetrics['lowStockProducts'];
}

const LowStockAlert = ({ products }: LowStockAlertProps) => {
  return (
    <Card className="glass-card border-red-500/20">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Estoque Baixo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div>
                <h4 className="font-medium text-white">{product.nome}</h4>
                <p className="text-sm text-gray-400">
                  Mín: {product.estoque_minimo}
                </p>
              </div>
              <Badge variant="destructive" className="bg-red-500/20 text-red-400">
                {product.estoque} restante(s)
              </Badge>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-center text-gray-400 py-4">
              Todos os produtos estão com estoque adequado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
