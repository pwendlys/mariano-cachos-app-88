
-- Criar tabela para observações dos clientes
CREATE TABLE public.observacoes_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  observacao TEXT NOT NULL,
  data_observacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_id UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.observacoes_clientes ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso total às observações
CREATE POLICY "Permitir acesso total para observacoes_clientes" 
  ON public.observacoes_clientes 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER handle_observacoes_clientes_updated_at
  BEFORE UPDATE ON public.observacoes_clientes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Adicionar índices para melhor performance
CREATE INDEX idx_observacoes_clientes_cliente_id ON public.observacoes_clientes(cliente_id);
CREATE INDEX idx_observacoes_clientes_data ON public.observacoes_clientes(data_observacao DESC);
