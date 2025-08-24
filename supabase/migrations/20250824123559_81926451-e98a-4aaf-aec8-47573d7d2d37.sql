
-- 1) Corrigir a FK de notificacoes.user_id para referenciar public.usuarios(id)
ALTER TABLE public.notificacoes
  DROP CONSTRAINT IF EXISTS notificacoes_user_id_fkey;

ALTER TABLE public.notificacoes
  ADD CONSTRAINT notificacoes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

-- 2) Atualizar a constraint do tipo para incluir 'sinal_solicitado'
ALTER TABLE public.notificacoes
  DROP CONSTRAINT IF EXISTS notificacoes_tipo_check;

ALTER TABLE public.notificacoes
  ADD CONSTRAINT notificacoes_tipo_check
  CHECK (tipo IN ('agendamento_aprovado', 'compra_concluida', 'sinal_solicitado'));

-- 3) Ajustar policies para leitura/atualização (mantendo INSERT do sistema)
DROP POLICY IF EXISTS "Usuarios podem ver suas notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Usuarios podem atualizar suas notificacoes" ON public.notificacoes;

CREATE POLICY "Usuarios podem ver suas notificacoes"
ON public.notificacoes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.id = notificacoes.user_id
      AND (u.id = auth.uid() OR u.email = auth.email())
  )
);

CREATE POLICY "Usuarios podem atualizar suas notificacoes"
ON public.notificacoes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.id = notificacoes.user_id
      AND (u.id = auth.uid() OR u.email = auth.email())
  )
);

-- Mantém a policy de INSERT do sistema já existente:
-- "Sistema pode criar notificacoes" WITH CHECK (true)

-- 4) Índice para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
