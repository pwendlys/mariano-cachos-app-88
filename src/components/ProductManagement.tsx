import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, X, TrendingDown, Filter, Star, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { uploadToBannerBucket } from '@/lib/supabaseStorage';
import ImageCropper from '@/components/banner/ImageCropper';
import BannerImageCropper from '@/components/banner/BannerImageCropper';

interface ProductFormData {
  name: string;
  brand: string;
  description: string;
  price: string;
  stock: string;
  minStock: string;
  category: string;
  image: string;
  bannerImage: string;
  costPrice: string;
  type: 'ecommerce' | 'interno';
  featured: boolean;
  featuredOrder: string;
}

const ProductManagement = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useSupabaseProducts();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'ecommerce' | 'interno'>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [showBannerCropper, setShowBannerCropper] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempBannerFile, setTempBannerFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [bannerCrop, setBannerCrop] = useState({ x: 0, y: 0 });
  const [bannerZoom, setBannerZoom] = useState(1);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    description: '',
    price: '',
    stock: '',
    minStock: '',
    category: 'outros',
    image: '',
    bannerImage: '',
    costPrice: '',
    type: 'ecommerce',
    featured: false,
    featuredOrder: ''
  });

  const categories = [
    { value: 'shampoo', label: 'Shampoo' },
    { value: 'condicionador', label: 'Condicionador' },
    { value: 'mascara', label: 'Máscara' },
    { value: 'creme', label: 'Creme' },
    { value: 'oleo', label: 'Óleo' },
    { value: 'styling', label: 'Finalização' },
    { value: 'tratamento', label: 'Tratamento' },
    { value: 'outros', label: 'Outros' }
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: '',
      stock: '',
      minStock: '',
      category: 'outros',
      image: '',
      bannerImage: '',
      costPrice: '',
      type: 'ecommerce',
      featured: false,
      featuredOrder: ''
    });
    setImagePreview('');
    setBannerImagePreview('');
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category || 'outros',
      image: product.image || '',
      bannerImage: product.bannerImage || '',
      costPrice: product.costPrice?.toString() || '',
      type: product.type || 'ecommerce',
      featured: product.featured || false,
      featuredOrder: product.featuredOrder?.toString() || ''
    });
    setImagePreview(product.image || '');
    setBannerImagePreview(product.bannerImage || '');
    setIsDialogOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTempImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTempBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBannerImagePreview(reader.result as string);
        setShowBannerCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!tempImageFile) return;

    try {
      setIsUploading(true);
      const { publicUrl } = await uploadToBannerBucket(tempImageFile, 'backgrounds');
      setFormData(prev => ({ ...prev, image: publicUrl }));
      setImagePreview(publicUrl);
      setShowImageCropper(false);
      setTempImageFile(null);
      toast({
        title: "Imagem salva!",
        description: "A imagem do produto foi carregada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBannerImage = async () => {
    if (!tempBannerFile) return;

    try {
      setIsBannerUploading(true);
      const { publicUrl } = await uploadToBannerBucket(tempBannerFile, 'backgrounds');
      setFormData(prev => ({ ...prev, bannerImage: publicUrl }));
      setBannerImagePreview(publicUrl);
      setShowBannerCropper(false);
      setTempBannerFile(null);
      toast({
        title: "Imagem de banner salva!",
        description: "A imagem de fundo do banner foi carregada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem de banner:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem de banner.",
        variant: "destructive",
      });
    } finally {
      setIsBannerUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.brand || !formData.price || !formData.stock || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      brand: formData.brand,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock) || 0,
      category: formData.category,
      image: formData.image || undefined,
      bannerImage: formData.bannerImage || undefined,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      type: formData.type,
      featured: formData.featured,
      featuredOrder: formData.featuredOrder ? parseInt(formData.featuredOrder) : 0
    };

    if (editingProduct) {
      const productWithId = { ...productData, id: editingProduct.id };
      await updateProduct(editingProduct.id, productWithId);
    } else {
      await addProduct(productData as any);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesLowStock = !showLowStock || product.stock <= product.minStock;
    
    return matchesSearch && matchesCategory && matchesType && matchesLowStock;
  });

  const getProductTypeBadgeClass = (type: string) => {
    return type === 'ecommerce' 
      ? 'bg-salon-gold/20 text-salon-gold' 
      : 'bg-salon-purple/20 text-salon-purple';
  };

  const getProductTypeLabel = (type: string) => {
    return type === 'ecommerce' ? 'E-commerce' : 'Interno';
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-salon-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-salon-gold">Gerenciar Produtos</h2>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
        >
          <Plus className="mr-2" size={16} />
          Novo Produto
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-card border-salon-gold/30 bg-transparent text-white placeholder:text-muted-foreground focus:border-salon-gold"
        />
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 glass-card border-salon-gold/30 bg-transparent text-white">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'all' | 'ecommerce' | 'interno')}>
          <SelectTrigger className="w-full md:w-48 glass-card border-salon-gold/30 bg-transparent text-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="interno">Interno</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showLowStock ? "default" : "outline"}
          onClick={() => setShowLowStock(!showLowStock)}
          className={showLowStock 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          }
        >
          <TrendingDown className="mr-2" size={16} />
          Estoque Baixo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="glass-card rounded-xl p-4 border border-salon-gold/20">
            <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-salon-dark/20">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="text-muted-foreground" size={32} />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white line-clamp-1">{product.name}</h3>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    className="h-8 w-8 text-salon-gold hover:bg-salon-gold/10"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProduct(product.id)}
                    className="h-8 w-8 text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-1 rounded ${getProductTypeBadgeClass(product.type)}`}>
                  {getProductTypeLabel(product.type)}
                </span>
                {product.featured && (
                  <span className="text-xs px-2 py-1 rounded bg-salon-gold/20 text-salon-gold flex items-center gap-1">
                    <Star size={12} className="fill-current" />
                    Destaque
                  </span>
                )}
              </div>
              <p className="text-sm text-salon-copper">{product.brand}</p>
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-salon-gold font-bold">R$ {product.price.toFixed(2)}</span>
                <span className={`text-sm ${product.stock <= product.minStock ? 'text-red-400' : 'text-muted-foreground'}`}>
                  Estoque: {product.stock}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border-salon-gold/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-salon-gold">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="brand" className="text-salon-gold">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-salon-gold">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="glass-card border-salon-gold/30 bg-transparent text-white min-h-20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="text-salon-gold">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="stock" className="text-salon-gold">Estoque *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="minStock" className="text-salon-gold">Estoque Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="text-salon-gold">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="costPrice" className="text-salon-gold">Preço de Custo</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="type" className="text-salon-gold">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: 'ecommerce' | 'interno') => setFormData({...formData, type: value})}>
                  <SelectTrigger className="glass-card border-salon-gold/30 bg-transparent text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="interno">Interno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-lg border border-salon-gold/20 bg-salon-dark/20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-salon-gold flex items-center gap-2">
                    <Star size={16} className="fill-current" />
                    Produto em Destaque
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Produtos em destaque aparecem no banner do e-commerce
                  </p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                />
              </div>

              {formData.featured && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <Label htmlFor="featuredOrder" className="text-salon-gold">Ordem no Banner</Label>
                    <Input
                      id="featuredOrder"
                      type="number"
                      value={formData.featuredOrder}
                      onChange={(e) => setFormData({...formData, featuredOrder: e.target.value})}
                      className="glass-card border-salon-gold/30 bg-transparent text-white w-32"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-salon-gold flex items-center gap-2">
                      <ImageIcon size={16} />
                      Imagem de Fundo do Banner
                    </Label>
                    
                    {bannerImagePreview && (
                      <div className="relative">
                        <img 
                          src={bannerImagePreview} 
                          alt="Preview do banner" 
                          className="w-full h-32 object-cover rounded-lg border border-salon-gold/20"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setBannerImagePreview('');
                            setFormData({...formData, bannerImage: ''});
                          }}
                          className="absolute top-2 right-2 h-8 w-8 bg-red-600/80 hover:bg-red-600 text-white"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    )}
                    
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="glass-card border-salon-gold/30 bg-transparent text-white file:bg-salon-gold file:text-salon-dark file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                    />
                    
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 800x400px (2:1) - Formatos: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-salon-gold">Imagem do Produto</Label>
              
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border border-salon-gold/20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({...formData, image: ''});
                    }}
                    className="absolute top-2 right-2 h-8 w-8 bg-red-600/80 hover:bg-red-600 text-white"
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="glass-card border-salon-gold/30 bg-transparent text-white file:bg-salon-gold file:text-salon-dark file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
              />
              
              <p className="text-xs text-muted-foreground">
                Recomendado: 400x400px (1:1) - Formatos: JPG, PNG, WebP
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
              >
                {editingProduct ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageCropper} onOpenChange={setShowImageCropper}>
        <DialogContent className="glass-card border-salon-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">Ajustar Imagem do Produto</DialogTitle>
          </DialogHeader>
          
          {imagePreview && (
            <ImageCropper
              image={imagePreview}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowImageCropper(false)}
              className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={isUploading}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
            >
              {isUploading ? 'Salvando...' : 'Salvar Imagem'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBannerCropper} onOpenChange={setShowBannerCropper}>
        <DialogContent className="glass-card border-salon-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">Ajustar Imagem do Banner</DialogTitle>
          </DialogHeader>
          
          {bannerImagePreview && (
            <BannerImageCropper
              image={bannerImagePreview}
              crop={bannerCrop}
              zoom={bannerZoom}
              onCropChange={setBannerCrop}
              onZoomChange={setBannerZoom}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowBannerCropper(false)}
              className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBannerImage}
              disabled={isBannerUploading}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
            >
              {isBannerUploading ? 'Salvando...' : 'Salvar Banner'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
