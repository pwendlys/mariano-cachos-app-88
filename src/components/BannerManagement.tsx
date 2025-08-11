
import React, { useState, useEffect } from 'react';
import { Image, Upload, X, Eye, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from '@/components/banner/ImageCropper';
import { useSupabaseBannerSettings, BannerSettingsWithMeta } from '@/hooks/useSupabaseBannerSettings';
import { uploadToBannerBucket } from '@/lib/supabaseStorage';

const BannerManagement = () => {
  const { toast } = useToast();
  const { banner, loading, updateBannerSettings } = useSupabaseBannerSettings();

  const [formData, setFormData] = useState({
    title: banner.title,
    subtitle: banner.subtitle,
    description: banner.description,
    image: banner.imageUrl || banner.image || '',
    logo: banner.logoUrl || banner.logo || '',
    isVisible: banner.isVisible
  });
  const [imagePreview, setImagePreview] = useState<string>(banner.imageUrl || banner.image || '');
  const [logoPreview, setLogoPreview] = useState<string>(banner.logoUrl || banner.logo || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Crop state
  const [crop, setCrop] = useState<{ x: number; y: number }>(banner.imageMeta?.crop || { x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(banner.imageMeta?.zoom || 1);
  const aspect = banner.imageMeta?.aspect || 2;

  useEffect(() => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      image: banner.imageUrl || banner.image || '',
      logo: banner.logoUrl || banner.logo || '',
      isVisible: banner.isVisible
    });
    setImagePreview(banner.imageUrl || banner.image || '');
    setLogoPreview(banner.logoUrl || banner.logo || '');
    setCrop(banner.imageMeta?.crop || { x: 0, y: 0 });
    setZoom(banner.imageMeta?.zoom || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner.id, banner.title, banner.subtitle, banner.description, banner.imageUrl, banner.logoUrl, banner.isVisible]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData({ ...formData, image: url });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setFormData({ ...formData, logo: url });
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setFormData({ ...formData, image: '' });
  };

  const removeLogo = () => {
    setLogoPreview('');
    setLogoFile(null);
    setFormData({ ...formData, logo: '' });
  };

  const handleSave = async () => {
    // Upload files if changed
    let newImageUrl: string | undefined;
    let newLogoUrl: string | undefined;

    // Upload banner background
    if (imageFile) {
      const { publicUrl } = await uploadToBannerBucket(imageFile, "backgrounds", "main-banner-bg");
      newImageUrl = publicUrl;
    }

    // Upload logo
    if (logoFile) {
      const { publicUrl } = await uploadToBannerBucket(logoFile, "logos", "main-banner-logo");
      newLogoUrl = publicUrl;
    }

    const updatedSettings: Partial<BannerSettingsWithMeta> = {
      id: banner.id,
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      imageUrl: newImageUrl ?? banner.imageUrl ?? banner.image ?? undefined,
      logoUrl: newLogoUrl ?? banner.logoUrl ?? banner.logo ?? undefined,
      isVisible: formData.isVisible,
      imageMeta: {
        crop,
        zoom,
        aspect,
      },
    };

    const saved = await updateBannerSettings(updatedSettings);

    toast({
      title: "Banner atualizado!",
      description: "As configurações do banner foram salvas com sucesso.",
    });

    // Ensure previews reflect saved URLs
    setImagePreview(saved.imageUrl || saved.image || '');
    setLogoPreview(saved.logoUrl || saved.logo || '');
    setImageFile(null);
    setLogoFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-salon-gold">Gestão do Banner Principal</h2>
      </div>

      <Card className="glass-card border-salon-gold/20">
        <CardHeader>
          <CardTitle className="text-salon-gold flex items-center gap-2">
            <Image size={20} />
            Configurações do Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Exibir Banner</p>
              <p className="text-sm text-muted-foreground">Mostrar o banner na página inicial</p>
            </div>
            <Switch
              checked={formData.isVisible}
              onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Logo</label>
            <div className="space-y-3">
              {logoPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={logoPreview} 
                    alt="Preview do Logo" 
                    className="w-24 h-24 object-contain rounded-lg bg-white/10 p-2"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeLogo}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-salon-gold/30 rounded-lg p-6 text-center w-32">
                  <ImageIcon className="mx-auto text-salon-gold mb-2" size={24} />
                  <p className="text-xs text-muted-foreground">Logo</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
              />
              <p className="text-xs text-muted-foreground">O logo aparecerá no banner e no topo do site</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Título Principal</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Marcos Mariano"
              className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Subtítulo</label>
            <Input
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              placeholder="Ex: Expert em Crespos e Cacheados"
              className="glass-card border-salon-gold/30 bg-transparent text-white h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Descrição</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição do banner..."
              className="glass-card border-salon-gold/30 bg-transparent text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Imagem de Fundo do Banner</label>
            <div className="space-y-3">
              {imagePreview ? (
                <>
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden border border-salon-gold/20">
                      <ImageCropper
                        image={imagePreview}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                      />
                    </div>
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
                </>
              ) : (
                <div className="border-2 border-dashed border-salon-gold/30 rounded-lg p-8 text-center">
                  <Upload className="mx-auto text-salon-gold mb-2" size={32} />
                  <p className="text-sm text-muted-foreground">Clique para adicionar uma imagem de fundo</p>
                  <p className="text-xs text-muted-foreground mt-1">Recomendado: 800x400px</p>
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

          <div className="pt-4">
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark font-medium h-12"
            >
              Salvar Configurações do Banner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Banner */}
      {formData.isVisible && (
        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-salon-gold flex items-center gap-2">
              <Eye size={20} />
              Preview do Banner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-3xl glass-card p-6 text-center min-h-[200px]">
              {imagePreview && (
                <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-30">
                  <img 
                    src={imagePreview} 
                    alt="Banner Background" 
                    className="w-full h-full object-cover"
                    style={{
                      transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              )}
              <div className="absolute inset-0 gradient-gold opacity-10"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-gold p-1">
                  <div className="w-full h-full rounded-full bg-salon-dark flex items-center justify-center">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        className="w-16 h-16 object-contain rounded-full"
                      />
                    ) : (
                      <img 
                        src="/lovable-uploads/6c513fb2-7005-451a-bfba-cb471f2086a3.png" 
                        alt="Marcos Mariano Logo" 
                        className="w-16 h-16 object-contain rounded-full"
                      />
                    )}
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
                  {formData.title}
                </h1>
                <p className="text-salon-copper font-medium mb-4">
                  {formData.subtitle}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{formData.description}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BannerManagement;
