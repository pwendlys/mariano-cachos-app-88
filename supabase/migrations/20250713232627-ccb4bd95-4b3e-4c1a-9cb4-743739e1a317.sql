-- Corrigir políticas RLS para historico_atendimentos
DROP POLICY IF EXISTS "Admin pode gerenciar histórico de atendimentos" ON public.historico_atendimentos;

CREATE POLICY "Permitir criacao de historico" ON public.historico_atendimentos
FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de historico" ON public.historico_atendimentos
FOR SELECT USING (true);

CREATE POLICY "Permitir atualizacao de historico" ON public.historico_atendimentos
FOR UPDATE USING (true);

-- Corrigir políticas RLS para saldos_clientes
DROP POLICY IF EXISTS "Admin pode gerenciar saldos de clientes" ON public.saldos_clientes;

CREATE POLICY "Permitir upsert de saldos" ON public.saldos_clientes
FOR ALL USING (true) WITH CHECK (true);