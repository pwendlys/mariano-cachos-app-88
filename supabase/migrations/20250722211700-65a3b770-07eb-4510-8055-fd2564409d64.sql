
-- Criar tabela para avaliações dos clientes
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  exibir_no_perfil BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(agendamento_id) -- Cada agendamento pode ter apenas uma avaliação
);

-- Habilitar RLS
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que clientes vejam suas próprias avaliações
CREATE POLICY "Clientes podem ver suas avaliacoes" 
  ON public.avaliacoes 
  FOR SELECT 
  USING (cliente_id IN (
    SELECT id FROM clientes WHERE email IN (
      SELECT email FROM usuarios WHERE id = auth.uid()
    )
  ));

-- Política para permitir que clientes criem avaliações
CREATE POLICY "Clientes podem criar avaliacoes" 
  ON public.avaliacoes 
  FOR INSERT 
  WITH CHECK (cliente_id IN (
    SELECT id FROM clientes WHERE email IN (
      SELECT email FROM usuarios WHERE id = auth.uid()
    )
  ));

-- Política para permitir que admin gerencie todas as avaliações
CREATE POLICY "Admin pode gerenciar avaliacoes" 
  ON public.avaliacoes 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo = 'admin'
  ));

-- Política para permitir leitura pública das avaliações aprovadas para exibição
CREATE POLICY "Avaliacoes aprovadas sao publicas" 
  ON public.avaliacoes 
  FOR SELECT 
  USING (status = 'aprovada' AND exibir_no_perfil = true);

-- Adicionar índices para melhor performance
CREATE INDEX idx_avaliacoes_agendamento_id ON public.avaliacoes(agendamento_id);
CREATE INDEX idx_avaliacoes_cliente_id ON public.avaliacoes(cliente_id);
CREATE INDEX idx_avaliacoes_status ON public.avaliacoes(status);
CREATE INDEX idx_avaliacoes_exibir_perfil ON public.avaliacoes(exibir_no_perfil);

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
