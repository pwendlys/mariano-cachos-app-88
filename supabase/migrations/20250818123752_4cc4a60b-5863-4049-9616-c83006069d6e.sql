
-- 1) Tabela de relação N:N entre profissionais e serviços
CREATE TABLE IF NOT EXISTS public.profissional_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profissional_servicos_unique UNIQUE (profissional_id, servico_id)
);

-- 2) Habilitar RLS
ALTER TABLE public.profissional_servicos ENABLE ROW LEVEL SECURITY;

-- 3) Políticas (seguindo o padrão permissivo existente em outras tabelas)
-- Permitir gerenciamento público (inserir/atualizar/deletar) - consistente com várias tabelas do projeto
CREATE POLICY "Permitir gerenciamento publico de profissional_servicos"
  ON public.profissional_servicos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Permitir leitura pública
CREATE POLICY "Permitir leitura publica de profissional_servicos"
  ON public.profissional_servicos
  FOR SELECT
  USING (true);

-- 4) Trigger para manter updated_at
DROP TRIGGER IF EXISTS set_profissional_servicos_updated_at ON public.profissional_servicos;
CREATE TRIGGER set_profissional_servicos_updated_at
BEFORE UPDATE ON public.profissional_servicos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Índices para performance
CREATE INDEX IF NOT EXISTS idx_profissional_servicos_profissional
  ON public.profissional_servicos (profissional_id);

CREATE INDEX IF NOT EXISTS idx_profissional_servicos_servico
  ON public.profissional_servicos (servico_id);

-- 6) Habilitar realtime para esse relacionamento
ALTER TABLE public.profissional_servicos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profissional_servicos;
