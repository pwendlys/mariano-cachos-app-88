
-- Criar bucket para armazenar imagens dos serviços
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);

-- Criar política para permitir leitura pública das imagens
CREATE POLICY "Permitir leitura publica de imagens de servicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

-- Criar política para permitir upload de imagens (admin)
CREATE POLICY "Permitir upload de imagens de servicos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'service-images');

-- Criar política para permitir atualização de imagens (admin)
CREATE POLICY "Permitir atualizacao de imagens de servicos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'service-images');

-- Criar política para permitir exclusão de imagens (admin)
CREATE POLICY "Permitir exclusao de imagens de servicos"
ON storage.objects FOR DELETE
USING (bucket_id = 'service-images');

-- Adicionar coluna de imagem na tabela servicos
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS imagem TEXT;

-- Habilitar atualizações em tempo real para a tabela servicos
ALTER TABLE public.servicos REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação do realtime (se não estiver já)
ALTER PUBLICATION supabase_realtime ADD TABLE public.servicos;
