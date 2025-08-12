
-- Atualizar políticas RLS para banner_settings para usar email
DROP POLICY IF EXISTS "Admin can manage banner settings" ON public.banner_settings;

CREATE POLICY "Admin can manage banner settings by email" 
ON public.banner_settings 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.email = auth.email() 
    AND u.tipo = 'admin' 
    AND u.ativo = true
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.email = auth.email() 
    AND u.tipo = 'admin' 
    AND u.ativo = true
  )
);

-- Criar políticas RLS para storage.objects no bucket 'banner'
CREATE POLICY "Admin can upload banner files by email" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'banner' AND 
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.email = auth.email() 
    AND u.tipo = 'admin' 
    AND u.ativo = true
  )
);

CREATE POLICY "Admin can update banner files by email" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'banner' AND 
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.email = auth.email() 
    AND u.tipo = 'admin' 
    AND u.ativo = true
  )
);

CREATE POLICY "Admin can delete banner files by email" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'banner' AND 
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.email = auth.email() 
    AND u.tipo = 'admin' 
    AND u.ativo = true
  )
);

CREATE POLICY "Public can view banner files" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'banner');
