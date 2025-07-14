
-- Configurar a tabela servicos para real-time
ALTER TABLE public.servicos REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação do real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.servicos;
