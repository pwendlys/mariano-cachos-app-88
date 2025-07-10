import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, X, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSharedProducts, Product } from '@/hooks/useSharedProducts';

interface ProductManagementProps {
  onStockEntry?: (productName: string, quantity: number, unitCost: number) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ onStockEntry }) => {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, updateProductStock } = useSharedProducts();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStockEntryOpen, setIsStockEntryOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [stockEntry, setStockEntry] = useState({
    quantity: '',
    unitCost: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    stock: '',
    minStock: '',
    category: '',
    image: '',
    costPrice: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = ['shampoo', 'mascara', 'oleo', 'creme', 'outros'];

  const handleStockEntry = (product: Product) => {
    setSelectedProductForStock(product);
    setStockEntry({
      quantity: '',
      unitCost: product.costPrice?.toString() || ''
    });
    setIsStockEntryOpen(true);
  };

  const handleConfirmStockEntry = () => {
    if (!selectedProductForStock || !stockEntry.quantity || !stockEntry.unitCost) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha quantidade e custo unitário.",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(stockEntry.quantity);
    const unitCost = parseFloat(stockEntry.unitCost);

    // Atualizar estoque do produto
    updateProductStock(
      selectedProductForStock.id, 
      selectedProductForStock.stock + quantity, 
      unitCost
    );

    // Chamar callback para adicionar despesa ao fluxo de caixa
    if (onStockEntry) {
      onStockEntry(selectedProductForStock.name, quantity, unitCost);
    }

    toast({
      title: "Entrada de estoque realizada!",
      description: `${quantity} unidades adicionadas ao estoque e despesa registrada no caixa.`,
    });

    setIsStockEntryOpen(false);
    setSelectedProductForStock(null);
    setStockEntry({ quantity: '', unitCost: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
      image: product.image || '',
      costPrice: product.costPrice?.toString() || ''
    });
    setImagePreview(product.image || '');
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: '',
      stock: '',
      minStock: '',
      category: '',
      image: '',
      costPrice: ''
    });
    setImagePreview('');
    setIsDialogOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setFormData({ ...formData, image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const handleSave = () => {
    if (!formData.name || !formData.brand || !formData.price || !formData.stock || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      brand: formData.brand,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock) || 1,
      category: formData.category,
      image: formData.image || undefined,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({
        title: "Produto atualizado!",
        description: "As informações do produto foram atualizadas.",
      });
    } else {
      addProduct(productData);
      toast({
        title: "Produto adicionado!",
        description: "Novo produto foi criado com sucesso.",
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (productId: string) => {
    deleteProduct(productId);
    toast({
      title: "Produto removido",
      description: "O produto foi excluído do sistema.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Gestão de Produtos e Estoque</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAdd}
              className="bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12 px-6"
            >
              <Plus className="mr-2" size={16} />
              Novo Produto
            </Button>
          </DialogTrigger>
          
          <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-salon-gold">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Shampoo Hidratante"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Marca *</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Ex: Salon Professional"
                  className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o produto..."
                  className="glass-card border-salon-gold/30 bg-transparent text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full h-12 px-3 glass-card border border-salon-gold/30 bg-transparent text-white rounded-md"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-salon-dark text-white">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foto do Produto</label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-salon-gold/30 rounded-lg p-4 text-center">
                      <Upload className="mx-auto text-salon-gold mb-2" size={24} />
                      <p className="text-sm text-muted-foreground">Clique para adicionar uma foto</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preço Venda (R$) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Custo (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    placeholder="0.00"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Inicial *</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Mínimo</label>
                  <Input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    placeholder="1"
                    className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
                >
                  {editingProduct ? 'Atualizar' : 'Criar'} Produto
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Entrada de Estoque */}
      <Dialog open={isStockEntryOpen} onOpenChange={setIsStockEntryOpen}>
        <DialogContent className="glass-card border-salon-gold/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-salon-gold">
              Entrada de Estoque - {selectedProductForStock?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantidade *</label>
              <Input
                type="number"
                value={stockEntry.quantity}
                onChange={(e) => setStockEntry({...stockEntry, quantity: e.target.value})}
                placeholder="0"
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custo Unitário (R$) *</label>
              <Input
                type="number"
                step="0.01"
                value={stockEntry.unitCost}
                onChange={(e) => setStockEntry({...stockEntry, unitCost: e.target.value})}
                placeholder="0.00"
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
            </div>

            {stockEntry.quantity && stockEntry.unitCost && (
              <div className="p-4 glass-card rounded-lg border border-salon-gold/30">
                <p className="text-sm text-muted-foreground">Total da entrada:</p>
                <p className="text-xl font-bold text-salon-gold">
                  R$ {(parseInt(stockEntry.quantity || '0') * parseFloat(stockEntry.unitCost || '0')).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta quantia será registrada como despesa no fluxo de caixa
                </p>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleConfirmStockEntry}
                className="flex-1 bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
              >
                Confirmar Entrada
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsStockEntryOpen(false)}
                className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-12"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="glass-card border-salon-gold/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {product.image && (
                  <div className="flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        console.log('Erro ao carregar imagem:', product.image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{product.name}</h3>
                  <p className="text-sm text-salon-copper">{product.brand}</p>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-salon-gold font-bold">R$ {product.price.toFixed(2)}</span>
                    {product.costPrice && (
                      <span className="text-xs text-muted-foreground">
                        Custo: R$ {product.costPrice.toFixed(2)}
                      </span>
                    )}
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.stock <= product.minStock 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      Estoque: {product.stock}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {product.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStockEntry(product)}
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-10"
                  >
                    <TrendingDown size={14} className="mr-1" />
                    Entrada
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 h-10"
                  >
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-10"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
