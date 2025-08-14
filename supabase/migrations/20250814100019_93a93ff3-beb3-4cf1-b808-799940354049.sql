
-- Remover as políticas RLS existentes da tabela gallery_photos
DROP POLICY IF EXISTS "Admin pode gerenciar gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Permitir leitura publica de fotos ativas" ON public.gallery_photos;

-- Criar função de segurança para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM usuarios u 
    WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
    AND u.tipo = 'admin' 
    AND u.ativo = true
  );
$$;

-- Criar política para permitir que admins gerenciem gallery_photos
CREATE POLICY "Admin pode gerenciar gallery_photos"
ON public.gallery_photos
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Criar política para permitir leitura pública de fotos ativas
CREATE POLICY "Permitir leitura publica de fotos ativas"
ON public.gallery_photos
FOR SELECT
USING (is_active = true);

-- Como alternativa, se não há JWT/auth configurado, criar política mais permissiva temporariamente
-- (descomente as linhas abaixo se a função acima não funcionar)

-- DROP POLICY IF EXISTS "Admin pode gerenciar gallery_photos" ON public.gallery_photos;
-- CREATE POLICY "Permitir gerenciamento temporario de gallery_photos"
-- ON public.gallery_photos
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);
