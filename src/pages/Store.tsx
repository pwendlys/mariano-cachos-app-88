
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSharedCart } from '@/hooks/useSharedCart';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import StoreHeader from '@/components/store/StoreHeader';
import SearchAndViewToggle from '@/components/store/SearchAndViewToggle';
import CategoryFilter from '@/components/store/CategoryFilter';
import ProductGrid from '@/components/store/ProductGrid';
import CartSummary from '@/components/store/CartSummary';

const Store = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, getTotalItems, getTotalPrice } = useSharedCart();
  const { products, loading } = useSupabaseProducts();

  const categories = [
    { id: 'all', name: 'Todos', count: products.length },
    { id: 'shampoo', name: 'Shampoos', count: products.filter(p => p.categoria === 'shampoo').length },
    { id: 'mascara', name: 'Máscaras', count: products.filter(p => p.categoria === 'mascara').length },
    { id: 'oleo', name: 'Óleos', count: products.filter(p => p.categoria === 'oleo').length },
    { id: 'creme', name: 'Cremes', count: products.filter(p => p.categoria === 'creme').length },
    { id: 'condicionador', name: 'Condicionadores', count: products.filter(p => p.categoria === 'condicionador').length },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductQuantity = (productId: string) => {
    return quantities[productId] || 1;
  };

  const updateQuantity = (productId: string, change: number) => {
    const currentQty = getProductQuantity(productId);
    const newQty = Math.max(1, currentQty + change);
    setQuantities(prev => ({
      ...prev,
      [productId]: newQty
    }));
  };

  const handleAddToCart = (product: typeof products[0]) => {
    const quantity = getProductQuantity(product.id);
    
    if (product.estoque < quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${product.estoque} unidades disponíveis.`,
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.nome,
      brand: product.marca,
      price: product.preco,
      image: product.imagem
    }, quantity);
    
    toast({
      title: "Produto adicionado! 🛒",
      description: `${quantity}x ${product.nome} adicionado ao carrinho.`,
    });
  };

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
      toast({
        title: "Removido dos favoritos",
        description: "Produto removido da sua lista de desejos.",
      });
    } else {
      setFavorites([...favorites, productId]);
      toast({
        title: "Adicionado aos favoritos! ❤️",
        description: "Produto salvo na sua lista de desejos.",
      });
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-salon-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 animate-fade-in">
      <StoreHeader 
        title="Produtos do Estoque"
        description="Produtos disponíveis em tempo real do nosso estoque"
      />

      <SearchAndViewToggle
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <ProductGrid
        products={filteredProducts}
        viewMode={viewMode}
        selectedCategory={selectedCategory}
        favorites={favorites}
        quantities={quantities}
        onToggleFavorite={toggleFavorite}
        onUpdateQuantity={updateQuantity}
        onAddToCart={handleAddToCart}
        getProductQuantity={getProductQuantity}
      />

      <CartSummary
        totalItems={getTotalItems()}
        totalPrice={getTotalPrice()}
      />
    </div>
  );
};

export default Store;
