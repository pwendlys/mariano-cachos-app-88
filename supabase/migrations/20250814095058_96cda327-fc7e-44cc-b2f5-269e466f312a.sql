
-- Criar tabela para fotos da galeria de atendimentos
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de fotos ativas
CREATE POLICY "Permitir leitura publica de fotos ativas" 
  ON public.gallery_photos 
  FOR SELECT 
  USING (is_active = true);

-- Política para admin gerenciar todas as fotos
CREATE POLICY "Admin pode gerenciar gallery_photos" 
  ON public.gallery_photos 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() AND tipo = 'admin' AND ativo = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() AND tipo = 'admin' AND ativo = true
  ));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_gallery_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_photos_updated_at
  BEFORE UPDATE ON public.gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_photos_updated_at();
