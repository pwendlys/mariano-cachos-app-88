
-- Permitir tipo 'convidado' na tabela de usuários

-- Remove o CHECK atual (nome gerado automaticamente pelo Postgres)
ALTER TABLE public.usuarios
  DROP CONSTRAINT IF EXISTS usuarios_tipo_check;

-- Cria um novo CHECK incluindo 'convidado'
ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_tipo_check
  CHECK (tipo IN ('cliente', 'admin', 'convidado'));
