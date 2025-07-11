
-- Criar tabela de devedores
CREATE TABLE IF NOT EXISTS public.devedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  documento TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de dívidas
CREATE TABLE IF NOT EXISTS public.dividas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devedor_id UUID REFERENCES public.devedores(id) NOT NULL,
  descricao TEXT NOT NULL,
  valor_original DECIMAL(10,2) NOT NULL,
  valor_atual DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_inclusao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'pago', 'parcelado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de cobranças
CREATE TABLE IF NOT EXISTS public.cobrancas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  divida_id UUID REFERENCES public.dividas(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'sms', 'ligacao')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'entregue', 'lido', 'respondido', 'erro')),
  data_envio TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  data_leitura TIMESTAMP WITH TIME ZONE,
  mensagem TEXT,
  resposta TEXT,
  tentativa INTEGER NOT NULL DEFAULT 1,
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas de cobrança
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;

-- Políticas para devedores (apenas admin pode gerenciar)
CREATE POLICY "Admin pode gerenciar devedores" ON public.devedores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Políticas para dívidas (apenas admin pode gerenciar)
CREATE POLICY "Admin pode gerenciar dividas" ON public.dividas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Políticas para cobranças (apenas admin pode gerenciar)
CREATE POLICY "Admin pode gerenciar cobrancas" ON public.cobrancas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_devedores_updated_at BEFORE UPDATE ON public.devedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dividas_updated_at BEFORE UPDATE ON public.dividas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
