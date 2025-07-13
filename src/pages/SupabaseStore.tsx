
import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Filter, Search, Grid3X3, List, Minus, Plus, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSharedCart } from '@/hooks/useSharedCart';
import { useSupabaseProducts, Product } from '@/hooks/useSupabaseProducts';
import { useNavigate } from 'react-router-dom';

const SupabaseStore = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, getTotalItems, getTotalPrice } = useSharedCart();
  const { products, loading } = useSupabaseProducts();

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

  const handleAddToCart = (product: Product) => {
    const quantity = getProductQuantity(product.id);
    
    if (product.stock < quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${product.stock} unidades disponíveis.`,
        variant: "destructive",
      });
      return;
    }

    addToCart({
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

  const ProductCard = ({ product }: { product: Product }) => {
    const isLowStock = product.stock <= product.minStock;
    const isOutOfStock = product.stock === 0;

    return (
      <Card className={`glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-all duration-300 group ${
        viewMode === 'list' ? 'w-full' : ''
      }`}>
        <CardContent className="p-4">
          <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-3'}`}>
            <div className={`relative ${viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'mb-3'}`}>
              <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'aspect-square'} bg-gradient-to-br from-salon-gold/20 to-salon-copper/20 rounded-lg overflow-hidden`}>
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="text-salon-gold" size={32} />
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 ${viewMode === 'list' ? 'w-6 h-6' : ''}`}
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart 
                  size={viewMode === 'list' ? 12 : 16} 
                  className={favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-white'} 
                />
              </Button>

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Esgotado</span>
                </div>
              )}
            </div>

            <div className={`${viewMode === 'list' ? 'flex-1' : 'space-y-2'}`}>
              <div className={viewMode === 'list' ? 'flex items-start justify-between' : 'space-y-2'}>
                <div className={viewMode === 'list' ? 'flex-1 pr-4' : ''}>
                  <h3 className={`font-semibold text-white ${viewMode === 'list' ? 'text-base' : 'text-sm'} line-clamp-2`}>
                    {product.name}
                  </h3>
                  <p className={`${viewMode === 'list' ? 'text-sm' : 'text-xs'} text-salon-copper`}>
                    {product.brand}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-salon-gold font-bold">R$ {product.price.toFixed(2)}</span>
                    {isLowStock && !isOutOfStock && (
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs">
                        <AlertTriangle size={10} className="mr-1" />
                        Baixo
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 mt-1">
                    <Package size={12} className="text-salon-gold" />
                    <span className="text-xs text-muted-foreground">
                      Estoque: {product.stock}
                    </span>
                  </div>

                  {viewMode === 'list' && product.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className={`${viewMode === 'list' ? 'flex items-center space-x-2' : 'space-y-2'}`}>
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-1 bg-salon-dark/50 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-salon-gold hover:bg-salon-gold/20"
                      onClick={() => updateQuantity(product.id, -1)}
                      disabled={getProductQuantity(product.id) <= 1}
                    >
                      <Minus size={12} />
                    </Button>
                    
                    <span className="text-white text-sm min-w-[2rem] text-center">
                      {getProductQuantity(product.id)}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-salon-gold hover:bg-salon-gold/20"
                      onClick={() => updateQuantity(product.id, 1)}
                      disabled={getProductQuantity(product.id) >= product.stock}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium ${
                      viewMode === 'list' ? 'h-10 px-6' : 'w-full text-sm h-12'
                    }`}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    {isOutOfStock ? 'Esgotado' : 'Adicionar'}
                  </Button>
                </div>
              </div>

              {viewMode === 'grid' && product.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
          Produtos do Estoque
        </h1>
        <p className="text-muted-foreground">
          Produtos disponíveis em tempo real do nosso estoque
        </p>
      </div>

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
      <div className="flex space-x-2 overflow-x-auto pb-2">
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

      {/* Products */}
      <div className="space-y-4">
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-24 left-4 right-4 glass-card rounded-2xl p-4">
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
  );
};

export default SupabaseStore;
