
-- Adiciona a coluna "detalhes" aos serviços
ALTER TABLE public.servicos
ADD COLUMN IF NOT EXISTS detalhes TEXT;
