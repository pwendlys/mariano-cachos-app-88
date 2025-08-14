
-- Adicionar coluna avatar_url na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN avatar_url text;

-- Criar bucket para avatars se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS para o bucket avatars
CREATE POLICY "Usuários podem ver avatars públicos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload de seus avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar seus avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seus avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
