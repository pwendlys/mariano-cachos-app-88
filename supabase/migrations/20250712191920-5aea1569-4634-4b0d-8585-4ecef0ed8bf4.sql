
-- Habilitar Realtime para a tabela produtos
ALTER TABLE public.produtos REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos;
