
-- Remover todas as tabelas existentes
DROP TABLE IF EXISTS public.observacoes_clientes CASCADE;
DROP TABLE IF EXISTS public.cobrancas CASCADE;
DROP TABLE IF EXISTS public.dividas CASCADE;
DROP TABLE IF EXISTS public.devedores CASCADE;
DROP TABLE IF EXISTS public.lista_negra CASCADE;
DROP TABLE IF EXISTS public.templates_mensagem CASCADE;
DROP TABLE IF EXISTS public.whatsapp_config CASCADE;
DROP TABLE IF EXISTS public.movimentacao_estoque CASCADE;
DROP TABLE IF EXISTS public.itens_venda CASCADE;
DROP TABLE IF EXISTS public.vendas CASCADE;
DROP TABLE IF EXISTS public.agendamentos CASCADE;
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover tipos/enums se existirem
DROP TYPE IF EXISTS public.agendamento_status CASCADE;
DROP TYPE IF EXISTS public.ride_status CASCADE;
DROP TYPE IF EXISTS public.servico_categoria CASCADE;
DROP TYPE IF EXISTS public.user_type CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Remover funções se existirem
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_usuarios() CASCADE;
DROP FUNCTION IF EXISTS public.handle_venda_estoque() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  senha TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'admin')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir cadastro de novos usuários
CREATE POLICY "Permitir cadastro de usuários" 
  ON public.usuarios 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir leitura de usuários (para login)
CREATE POLICY "Permitir leitura de usuários" 
  ON public.usuarios 
  FOR SELECT 
  USING (true);

-- Política para permitir atualização de usuários próprios
CREATE POLICY "Permitir atualização própria" 
  ON public.usuarios 
  FOR UPDATE 
  USING (true);

-- Inserir admin pré-cadastrado (senha: adm@2025)
INSERT INTO public.usuarios (nome, email, senha, tipo, whatsapp) 
VALUES (
  'Administrador', 
  'adm@adm.com', 
  'adm@2025', -- senha em texto simples para simplificar
  'admin',
  '(11) 99999-9999'
) ON CONFLICT (email) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_usuarios();
