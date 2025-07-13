
-- Primeiro, vamos remover as políticas existentes que não funcionam com auth personalizado
DROP POLICY IF EXISTS "Clientes podem ver seus dados" ON public.clientes;
DROP POLICY IF EXISTS "Admin pode ver todos os clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir criação de clientes" ON public.clientes;

-- Agora vamos criar políticas que funcionam sem autenticação Supabase nativa
-- Como estamos usando sistema de auth personalizado, vamos permitir operações públicas
-- mas controladas pela aplicação

-- Política para permitir leitura de clientes (todos podem ler, controle feito na aplicação)
CREATE POLICY "Permitir leitura publica de clientes" 
ON public.clientes 
FOR SELECT 
USING (true);

-- Política para permitir criação de clientes (todos podem criar, controle feito na aplicação)  
CREATE POLICY "Permitir criacao publica de clientes"
ON public.clientes
FOR INSERT
WITH CHECK (true);

-- Política para permitir atualização de clientes (todos podem atualizar, controle feito na aplicação)
CREATE POLICY "Permitir atualizacao publica de clientes"
ON public.clientes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Política para permitir exclusão de clientes (todos podem excluir, controle feito na aplicação)
CREATE POLICY "Permitir exclusao publica de clientes"
ON public.clientes
FOR DELETE
USING (true);

-- Vamos também ajustar as políticas de agendamentos para funcionar sem auth nativo
DROP POLICY IF EXISTS "Clientes podem ver seus agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Admin pode ver todos os agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Permitir criação de agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Admin pode gerenciar agendamentos" ON public.agendamentos;

-- Políticas públicas para agendamentos (controle feito na aplicação)
CREATE POLICY "Permitir leitura publica de agendamentos"
ON public.agendamentos
FOR SELECT
USING (true);

CREATE POLICY "Permitir criacao publica de agendamentos"
ON public.agendamentos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualizacao publica de agendamentos"
ON public.agendamentos
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir exclusao publica de agendamentos"
ON public.agendamentos
FOR DELETE
USING (true);
