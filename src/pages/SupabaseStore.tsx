
import React, { useState } from 'react';
import { Search, Grid3X3, List, Package, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeCart } from '@/hooks/useRealtimeCart';
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts';
import { useRealtimeStockUpdate } from '@/hooks/useRealtimeStockUpdate';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import StockWarnings from '@/components/StockWarnings';
import OrnateHeading from '@/components/OrnateHeading';
import ProductBannerCarousel from '@/components/ProductBannerCarousel';

const SupabaseStore = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Only show e-commerce products in the store
  const { products, loading } = useRealtimeProducts('ecommerce');
  const { 
    addToCartWithValidation, 
    getTotalItems, 
    getTotalPrice, 
    stockWarnings, 
    clearStockWarnings 
  } = useRealtimeCart();
  
  // Add real-time stock alerts
  useRealtimeStockUpdate();

  const categories = [
    { id: 'all', name: 'Todos', count: products.length },
    { id: 'shampoo', name: 'Shampoos', count: products.filter(p => p.category === 'shampoo').length },
    { id: 'mascara', name: 'Máscaras', count: products.filter(p => p.category === 'mascara').length },
    { id: 'oleo', name: 'Óleos', count: products.filter(p => p.category === 'oleo').length },
    { id: 'creme', name: 'Cremes', count: products.filter(p => p.category === 'creme').length },
    { id: 'condicionador', name: 'Condicionadores', count: products.filter(p => p.category === 'condicionador').length },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedProducts = filteredProducts.slice(0, 4);

  const handleAddToCart = (product: any, quantity: number) => {
    try {
      addToCartWithValidation({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image
      }, quantity);
      
      toast({
        title: "Produto adicionado! 🛒",
        description: `${quantity}x ${product.name} adicionado ao carrinho.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
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
    <>
      <StockWarnings warnings={stockWarnings} onDismiss={clearStockWarnings} />
      
      <div className="px-4 space-y-6 animate-fade-in">
        <OrnateHeading 
          title="Produtos Especializados" 
          subtitle="Cuide dos seus cachos com produtos de qualidade"
          showLogo={true}
        />

        {/* Banner de Produtos em Destaque */}
        <ProductBannerCarousel onAddToCart={handleAddToCart} />

        {/* Search and View Toggle */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-salon-gold/30 bg-transparent text-white placeholder:text-muted-foreground focus:border-salon-gold h-12"
            />
          </div>
          
          <div className="flex space-x-1 bg-salon-dark/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className={`h-10 w-10 ${
                viewMode === 'grid'
                  ? 'bg-salon-gold text-salon-dark hover:bg-salon-copper'
                  : 'text-salon-gold hover:bg-salon-gold/10'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={20} />
            </Button>
            
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className={`h-10 w-10 ${
                viewMode === 'list'
                  ? 'bg-salon-gold text-salon-dark hover:bg-salon-copper'
                  : 'text-salon-gold hover:bg-salon-gold/10'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap h-12 ${
                selectedCategory === category.id 
                  ? 'bg-salon-gold text-salon-dark hover:bg-salon-copper' 
                  : 'border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Recommended Products */}
        {selectedCategory === 'all' && recommendedProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-salon-gold flex items-center gap-2">
              <Star className="text-salon-gold fill-current" size={20} />
              Produtos que combinam com você
            </h2>
            
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
              {recommendedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  viewMode={viewMode}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="space-y-4">
          {selectedCategory === 'all' && recommendedProducts.length > 0 && (
            <h2 className="text-lg font-semibold text-salon-gold">Todos os Produtos</h2>
          )}
          
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {products.length === 0 
                  ? 'Nenhum produto no estoque. Adicione produtos pelo painel admin.' 
                  : 'Nenhum produto encontrado para sua busca.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-24 left-4 right-4 glass-card rounded-2xl p-4 z-30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-salon-gold font-medium">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
                </p>
                <p className="text-white text-sm">
                  Total: R$ {getTotalPrice().toFixed(2)}
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
        )}
      </div>
    </>
  );
};

export default SupabaseStore;
