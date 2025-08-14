
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Grid, List, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSharedCart } from '@/hooks/useSharedCart';
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import ProductBannerCarousel from '@/components/ProductBannerCarousel';
import OrnateHeading from '@/components/OrnateHeading';

const SupabaseStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useSharedCart();
  const { products, loading } = useRealtimeProducts('ecommerce');
  const { featuredProducts, loading: featuredLoading } = useFeaturedProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = Array.from(new Set(products.map(product => product.category)));
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-all duration-300 group">
      <CardContent className="p-3">
        <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-salon-dark/50">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-salon-copper">
              <ShoppingCart size={40} />
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-xs">
              Últimas {product.stock}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
              Esgotado
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-white text-sm line-clamp-2">{product.name}</h3>
          <p className="text-salon-copper text-xs">{product.brand}</p>
          <div className="flex items-center justify-between">
            <span className="text-salon-gold font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              size="sm"
              className="bg-salon-gold hover:bg-salon-gold/90 text-salon-dark font-medium px-3 py-1 h-8 text-xs"
            >
              <ShoppingCart size={14} className="mr-1" />
              Add
            </Button>
          </div>
          <div className="text-xs text-salon-copper">
            Estoque: {product.stock}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-copper/20 p-3 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full border border-salon-gold flex items-center justify-center bg-black/50">
              <span className="text-salon-gold font-bold text-sm">MM</span>
            </div>
            <h1 className="text-salon-gold font-playfair text-xl font-bold">Produtos</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-salon-gold hover:bg-salon-gold/10 w-10 h-10"
            >
              <div className="w-6 h-6 bg-salon-gold rounded-sm"></div>
            </Button>
            <Button
              onClick={() => navigate('/carrinho')}
              variant="ghost"
              size="icon"
              className="text-salon-gold hover:bg-salon-gold/10 relative w-10 h-10"
            >
              <ShoppingCart size={20} />
            </Button>
            <div className="w-10 h-10 rounded-full bg-salon-gold/20 border border-salon-gold"></div>
          </div>
        </div>

        {/* Featured Products Section */}
        {!featuredLoading && featuredProducts.length > 0 && (
          <div className="mb-6">
            <OrnateHeading 
              title="Produtos Especializados" 
              subtitle="Cuide dos seus cachos com produtos de qualidade"
              className="mb-4"
            />
            <div className="relative">
              <div className="glass-card border-salon-gold/20 p-4 rounded-2xl">
                <div className="flex items-center mb-3">
                  <Star className="text-salon-gold mr-2" size={20} />
                  <span className="text-salon-gold font-medium">Produto em Destaque</span>
                </div>
                
                {featuredProducts.slice(0, 1).map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-salon-dark/50 flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-salon-copper">
                          <ShoppingCart size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm mb-1 truncate">{product.name}</h3>
                      <p className="text-salon-copper text-xs mb-2">{product.brand}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-salon-gold font-bold text-xl">
                          {formatPrice(product.price)}
                        </span>
                        <div className="text-xs text-salon-copper">
                          Estoque: {product.stock}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-salon-gold hover:bg-salon-gold/90 text-salon-dark font-medium px-4 py-2 h-9 text-sm flex-shrink-0"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-salon-copper" size={18} />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-salon-gold/30 bg-transparent text-white h-12"
            />
          </div>

          {/* View Mode and Category Filter Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="w-10 h-10 p-0"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="w-10 h-10 p-0"
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          {/* Category Filter Buttons - Scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className="whitespace-nowrap bg-salon-gold/20 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/30 flex-shrink-0"
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap bg-salon-gold/20 border-salon-gold/30 text-salon-gold hover:bg-salon-gold/30 flex-shrink-0"
              >
                {category} ({products.filter(p => p.category === category).length})
              </Button>
            ))}
          </div>
        </div>

        {/* Products que combinam com você */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Star className="text-salon-gold mr-2" size={20} />
            <h2 className="text-salon-gold font-playfair text-lg font-bold">
              Produtos que combinam com você
            </h2>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card border-salon-gold/20">
                <CardContent className="p-3">
                  <Skeleton className="aspect-square w-full mb-3 rounded-lg" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-salon-copper mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-salon-copper">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseStore;
