
-- Remover as políticas existentes que estão causando problema
DROP POLICY IF EXISTS "Serviços visíveis para todos" ON public.servicos;
DROP POLICY IF EXISTS "Apenas admin pode gerenciar serviços" ON public.servicos;

-- Criar políticas mais permissivas para permitir operações
CREATE POLICY "Permitir leitura de servicos" ON public.servicos FOR SELECT USING (true);
CREATE POLICY "Permitir criacao de servicos" ON public.servicos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao de servicos" ON public.servicos FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusao de servicos" ON public.servicos FOR DELETE USING (true);
