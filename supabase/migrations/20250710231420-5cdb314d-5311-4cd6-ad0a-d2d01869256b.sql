
-- Criar enum para status dos agendamentos
CREATE TYPE agendamento_status AS ENUM ('livre', 'pendente', 'ocupado', 'cancelado');

-- Criar enum para categorias de serviços
CREATE TYPE servico_categoria AS ENUM ('corte', 'coloracao', 'tratamento', 'finalizacao', 'outros');

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  duracao INTEGER NOT NULL, -- em minutos
  preco DECIMAL(10,2) NOT NULL,
  categoria servico_categoria NOT NULL DEFAULT 'outros',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE RESTRICT,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  status agendamento_status DEFAULT 'pendente',
  valor DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraint para evitar agendamentos duplicados no mesmo horário
  UNIQUE(data, horario)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir acesso público (ajustar conforme necessário)
CREATE POLICY "Permitir acesso total para clientes" ON public.clientes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de serviços" ON public.servicos
  FOR SELECT USING (ativo = true);

CREATE POLICY "Permitir acesso total para agendamentos" ON public.agendamentos
  FOR ALL USING (true) WITH CHECK (true);

-- Inserir alguns serviços de exemplo
INSERT INTO public.servicos (nome, duracao, preco, categoria) VALUES
  ('Corte Feminino', 60, 50.00, 'corte'),
  ('Corte Masculino', 30, 30.00, 'corte'),
  ('Coloração Completa', 180, 120.00, 'coloracao'),
  ('Hidratação', 90, 80.00, 'tratamento'),
  ('Escova Progressiva', 240, 200.00, 'tratamento'),
  ('Finalização Simples', 30, 25.00, 'finalizacao');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
