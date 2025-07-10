
-- Criar tabela de devedores
CREATE TABLE public.devedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  documento TEXT, -- CPF/CNPJ
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de dívidas
CREATE TABLE public.dividas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devedor_id UUID REFERENCES public.devedores(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor_original DECIMAL(12,2) NOT NULL,
  valor_atual DECIMAL(12,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_inclusao DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'pago', 'parcelado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de cobranças
CREATE TABLE public.cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  divida_id UUID REFERENCES public.dividas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'sms', 'ligacao')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'entregue', 'lido', 'respondido', 'erro')),
  data_envio TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  data_leitura TIMESTAMP WITH TIME ZONE,
  mensagem TEXT,
  resposta TEXT,
  tentativa INTEGER DEFAULT 1,
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de templates de mensagem
CREATE TABLE public.templates_mensagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('inicial', 'lembrete', 'urgente', 'acordo', 'juridico')),
  assunto TEXT,
  mensagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de configurações WhatsApp
CREATE TABLE public.whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  api_key TEXT,
  webhook_url TEXT,
  status TEXT DEFAULT 'inativo' CHECK (status IN ('ativo', 'inativo', 'erro')),
  ultimo_ping TIMESTAMP WITH TIME ZONE,
  configuracoes JSONB, -- Para configurações específicas da API
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de lista negra (números que não devem receber mensagens)
CREATE TABLE public.lista_negra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL UNIQUE,
  motivo TEXT,
  data_inclusao DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_mensagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_negra ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Permitir acesso total por enquanto (ajustar conforme necessário)
CREATE POLICY "Permitir acesso total devedores" ON public.devedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total dividas" ON public.dividas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total cobrancas" ON public.cobrancas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total templates" ON public.templates_mensagem FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total whatsapp_config" ON public.whatsapp_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total lista_negra" ON public.lista_negra FOR ALL USING (true) WITH CHECK (true);

-- Índices para melhor performance
CREATE INDEX idx_devedores_telefone ON public.devedores(telefone);
CREATE INDEX idx_devedores_documento ON public.devedores(documento);
CREATE INDEX idx_dividas_devedor_id ON public.dividas(devedor_id);
CREATE INDEX idx_dividas_status ON public.dividas(status);
CREATE INDEX idx_dividas_vencimento ON public.dividas(data_vencimento);
CREATE INDEX idx_cobrancas_divida_id ON public.cobrancas(divida_id);
CREATE INDEX idx_cobrancas_status ON public.cobrancas(status);
CREATE INDEX idx_cobrancas_tipo ON public.cobrancas(tipo);

-- Triggers para atualizar updated_at
CREATE TRIGGER handle_devedores_updated_at
  BEFORE UPDATE ON public.devedores
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_dividas_updated_at
  BEFORE UPDATE ON public.dividas
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_templates_updated_at
  BEFORE UPDATE ON public.templates_mensagem
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_whatsapp_config_updated_at
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Inserir alguns templates padrão
INSERT INTO public.templates_mensagem (nome, tipo, assunto, mensagem) VALUES
  ('Cobrança Inicial', 'inicial', 'Lembrete de Pagamento', 'Olá {nome}, você possui uma pendência no valor de R$ {valor} com vencimento em {data_vencimento}. Para regularizar, entre em contato conosco.'),
  ('Lembrete Amigável', 'lembrete', 'Lembrete de Vencimento', 'Oi {nome}! Lembrando que você tem um pagamento de R$ {valor} que vence em {data_vencimento}. Qualquer dúvida, estamos aqui para ajudar!'),
  ('Cobrança Urgente', 'urgente', 'Pagamento em Atraso', '{nome}, sua conta de R$ {valor} está em atraso desde {data_vencimento}. É importante regularizar para evitar maiores complicações.'),
  ('Proposta de Acordo', 'acordo', 'Proposta de Negociação', 'Olá {nome}, temos uma proposta especial para quitação da sua dívida de R$ {valor}. Entre em contato para negociarmos as melhores condições.'),
  ('Aviso Jurídico', 'juridico', 'Últimos Dias para Regularização', '{nome}, esta é nossa última tentativa amigável. Sua dívida de R$ {valor} será encaminhada ao jurídico se não regularizada em 48 horas.');

-- Inserir configuração padrão do WhatsApp
INSERT INTO public.whatsapp_config (nome, telefone, status) VALUES
  ('Configuração Principal', '5511999999999', 'inativo');
