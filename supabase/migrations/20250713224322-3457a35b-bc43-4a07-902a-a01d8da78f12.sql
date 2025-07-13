
-- Criar tabela para histórico de atendimentos
CREATE TABLE public.historico_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  data_atendimento TIMESTAMP WITH TIME ZONE DEFAULT now(),
  servicos_extras JSONB DEFAULT '[]',
  produtos_vendidos JSONB DEFAULT '[]',
  valor_servicos_extras NUMERIC DEFAULT 0,
  valor_produtos NUMERIC DEFAULT 0,
  observacoes TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.historico_atendimentos ENABLE ROW LEVEL SECURITY;

-- Policy para admin gerenciar histórico
CREATE POLICY "Admin pode gerenciar histórico de atendimentos" 
  ON public.historico_atendimentos 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo = 'admin'
  ));

-- Criar tabela para saldos dos clientes
CREATE TABLE public.saldos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE UNIQUE,
  saldo_devedor NUMERIC DEFAULT 0,
  total_pago NUMERIC DEFAULT 0,
  total_servicos NUMERIC DEFAULT 0,
  total_produtos NUMERIC DEFAULT 0,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.saldos_clientes ENABLE ROW LEVEL SECURITY;

-- Policy para admin gerenciar saldos
CREATE POLICY "Admin pode gerenciar saldos de clientes" 
  ON public.saldos_clientes 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo = 'admin'
  ));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_historico()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_historico_atendimentos_updated_at
  BEFORE UPDATE ON public.historico_atendimentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_historico();

CREATE TRIGGER update_saldos_clientes_updated_at
  BEFORE UPDATE ON public.saldos_clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_historico();
