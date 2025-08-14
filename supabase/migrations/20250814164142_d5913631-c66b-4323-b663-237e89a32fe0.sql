
-- Remover políticas RLS existentes para avatars
DROP POLICY IF EXISTS "Usuários podem ver avatars públicos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus avatars" ON storage.objects;

-- Criar novas políticas RLS que funcionem com autenticação personalizada
CREATE POLICY "Permitir leitura pública de avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários autenticados podem fazer upload de avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE email = auth.email() AND ativo = true
  )
);

CREATE POLICY "Usuários podem atualizar seus próprios avatars" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE email = auth.email() AND ativo = true
  )
);

CREATE POLICY "Usuários podem deletar seus próprios avatars" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE email = auth.email() AND ativo = true
  )
);
