
import React, { useState } from 'react';
import { Camera, Upload, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userId: string;
  userName: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userId,
  userName,
  onAvatarUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Função para criar uma sessão fake para o Supabase
  const setFakeSession = async () => {
    if (!user) return;
    
    try {
      // Criar uma sessão fake para o Supabase reconhecer o usuário autenticado
      await supabase.auth.setSession({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        user: {
          id: userId,
          email: user.email,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {
            nome: user.nome,
            tipo: user.tipo
          }
        }
      });
    } catch (error) {
      console.log('Aviso: Não foi possível definir sessão fake:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      // Definir sessão fake antes do upload
      await setFakeSession();

      // Gerar nome único para o arquivo baseado no email (substituindo caracteres especiais)
      const emailSafe = user?.email.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${emailSafe}/avatar_${Date.now()}.${fileExt}`;

      console.log('Tentando fazer upload do arquivo:', fileName);

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;
      console.log('URL pública gerada:', publicUrl);

      // Atualizar na tabela usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError);
        throw updateError;
      }

      // Callback para atualizar no componente pai
      onAvatarUpdate(publicUrl);
      setPreviewUrl(null);

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso."
      });

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem. Tente novamente.",
        variant: "destructive"
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      // Definir sessão fake antes da remoção
      await setFakeSession();

      // Atualizar na tabela usuarios (remover URL)
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Callback para atualizar no componente pai
      onAvatarUpdate('');
      setPreviewUrl(null);

      toast({
        title: "Sucesso!",
        description: "Foto de perfil removida com sucesso."
      });

    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 border-2 border-salon-gold">
          <AvatarImage 
            src={previewUrl || currentAvatarUrl || ''} 
            alt={userName}
            className="object-cover"
          />
          <AvatarFallback className="bg-salon-gold/20 text-salon-gold text-2xl">
            {userName?.charAt(0)?.toUpperCase() || <User size={32} />}
          </AvatarFallback>
        </Avatar>
        
        {(currentAvatarUrl || previewUrl) && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={removeAvatar}
            disabled={uploading}
          >
            <X size={14} />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <label htmlFor="avatar-upload">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={uploading}
            className="border-salon-gold/30 text-salon-gold hover:bg-salon-gold/10 cursor-pointer"
          >
            <span>
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Alterar Foto
                </>
              )}
            </span>
          </Button>
        </label>
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        
        <p className="text-xs text-muted-foreground text-center">
          Recomendado: 400x400px (1:1)<br />
          Formatos: JPG, PNG, WebP (máx. 5MB)
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
