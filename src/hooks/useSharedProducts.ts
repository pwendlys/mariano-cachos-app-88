
import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  image?: string;
  costPrice?: number;
}

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Shampoo Hidratante Crespos',
    brand: 'Salon Professional',
    description: 'Limpeza suave para cabelos crespos e cacheados',
    price: 89.90,
    stock: 15,
    minStock: 5,
    category: 'shampoo',
    image: '/lovable-uploads/62560d60-dd02-4d14-a219-49f2791caa7d.png',
    costPrice: 45.00
  },
  {
    id: '2',
    name: 'Máscara Nutritiva Intensiva',
    brand: 'Curly Care',
    description: 'Nutrição profunda para cachos definidos',
    price: 156.90,
    stock: 8,
    minStock: 3,
    category: 'mascara',
    image: '/lovable-uploads/3db478af-14c5-4827-b74f-11c73955a529.png',
    costPrice: 78.00
  }
];

export const useSharedProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('salon-products');
    return stored ? JSON.parse(stored) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('salon-products', JSON.stringify(products));
  }, [products]);

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (productId: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateProductStock = (productId: string, newStock: number, newCostPrice?: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, stock: newStock, ...(newCostPrice && { costPrice: newCostPrice }) }
        : p
    ));
  };

  return {
    products,
    updateProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
  };
};
