
-- Adicionar campo tipo_produto na tabela produtos (se não existir)
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS tipo_produto TEXT DEFAULT 'ecommerce' CHECK (tipo_produto IN ('ecommerce', 'interno'));

-- Criar tabela para configurações de comissão
CREATE TABLE IF NOT EXISTS public.configuracoes_comissao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL,
  tipo_comissao TEXT NOT NULL CHECK (tipo_comissao IN ('percentual', 'fixo')),
  valor_comissao NUMERIC NOT NULL CHECK (valor_comissao >= 0),
  categoria_servico TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para comissões calculadas
CREATE TABLE IF NOT EXISTS public.comissoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL,
  tipo_origem TEXT NOT NULL CHECK (tipo_origem IN ('agendamento', 'venda')),
  origem_id UUID NOT NULL,
  valor_base NUMERIC NOT NULL,
  percentual_comissao NUMERIC NOT NULL,
  valor_comissao NUMERIC NOT NULL,
  data_referencia DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'calculada' CHECK (status IN ('calculada', 'paga', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para profissionais
CREATE TABLE IF NOT EXISTS public.profissionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  especialidades TEXT[] DEFAULT '{}',
  avatar TEXT,
  ativo BOOLEAN DEFAULT true,
  percentual_comissao_padrao NUMERIC DEFAULT 0 CHECK (percentual_comissao_padrao >= 0 AND percentual_comissao_padrao <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo profissional_id nas tabelas agendamentos e vendas
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS profissional_id UUID;

ALTER TABLE public.vendas 
ADD COLUMN IF NOT EXISTS profissional_id UUID;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.configuracoes_comissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

-- Políticas para configurações de comissão
CREATE POLICY "Admin pode gerenciar configuracoes_comissao" 
  ON public.configuracoes_comissao 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para comissões
CREATE POLICY "Admin pode gerenciar comissoes" 
  ON public.comissoes 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para profissionais
CREATE POLICY "Permitir leitura publica de profissionais" 
  ON public.profissionais 
  FOR SELECT 
  USING (ativo = true);

CREATE POLICY "Admin pode gerenciar profissionais" 
  ON public.profissionais 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Função para calcular comissão de agendamento
CREATE OR REPLACE FUNCTION calcular_comissao_agendamento()
RETURNS TRIGGER AS $$
DECLARE
  config_comissao RECORD;
  valor_comissao NUMERIC;
  percentual_aplicado NUMERIC;
  profissional_nome TEXT;
BEGIN
  -- Verificar se o status mudou para 'concluido' e tem profissional
  IF NEW.status = 'concluido' AND 
     NEW.profissional_id IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    
    -- Buscar configuração de comissão do profissional
    SELECT * INTO config_comissao
    FROM configuracoes_comissao cc
    WHERE cc.profissional_id = NEW.profissional_id
      AND cc.ativo = true
      AND (cc.categoria_servico IS NULL OR cc.categoria_servico = (
        SELECT categoria FROM servicos WHERE id = NEW.servico_id
      ))
    ORDER BY cc.categoria_servico NULLS LAST
    LIMIT 1;
    
    -- Se não encontrou configuração específica, usar padrão do profissional
    IF NOT FOUND THEN
      SELECT percentual_comissao_padrao INTO percentual_aplicado
      FROM profissionais
      WHERE id = NEW.profissional_id;
      
      percentual_aplicado := COALESCE(percentual_aplicado, 0);
    ELSE
      percentual_aplicado := config_comissao.valor_comissao;
    END IF;
    
    -- Calcular valor da comissão
    valor_comissao := (COALESCE(NEW.valor, 0) * percentual_aplicado) / 100;
    
    -- Registrar comissão
    INSERT INTO comissoes (
      profissional_id,
      tipo_origem,
      origem_id,
      valor_base,
      percentual_comissao,
      valor_comissao,
      data_referencia
    ) VALUES (
      NEW.profissional_id,
      'agendamento',
      NEW.id,
      COALESCE(NEW.valor, 0),
      percentual_aplicado,
      valor_comissao,
      NEW.data
    );
    
    -- Buscar nome do profissional
    SELECT nome INTO profissional_nome
    FROM profissionais
    WHERE id = NEW.profissional_id;
    
    -- Registrar comissão no fluxo de caixa
    INSERT INTO fluxo_caixa (
      data,
      tipo,
      categoria,
      descricao,
      valor,
      origem_tipo,
      origem_id,
      profissional_nome,
      metadata
    ) VALUES (
      NEW.data,
      'saida',
      'Comissões',
      'Comissão - ' || COALESCE(profissional_nome, 'Profissional'),
      valor_comissao,
      'comissao_agendamento',
      NEW.id,
      profissional_nome,
      jsonb_build_object(
        'agendamento_id', NEW.id,
        'profissional_id', NEW.profissional_id,
        'percentual', percentual_aplicado,
        'valor_base', COALESCE(NEW.valor, 0)
      )
    );
    
    RAISE NOTICE 'Comissão calculada: % para profissional %', valor_comissao, profissional_nome;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular comissão de venda
CREATE OR REPLACE FUNCTION calcular_comissao_venda()
RETURNS TRIGGER AS $$
DECLARE
  config_comissao RECORD;
  valor_comissao NUMERIC;
  percentual_aplicado NUMERIC;
  profissional_nome TEXT;
BEGIN
  -- Verificar se é uma nova venda finalizada e tem profissional
  IF NEW.status = 'finalizada' AND 
     NEW.profissional_id IS NOT NULL AND 
     (OLD IS NULL OR OLD.status != 'finalizada') THEN
    
    -- Buscar configuração de comissão do profissional para produtos
    SELECT * INTO config_comissao
    FROM configuracoes_comissao cc
    WHERE cc.profissional_id = NEW.profissional_id
      AND cc.ativo = true
      AND cc.categoria_servico = 'produtos'
    LIMIT 1;
    
    -- Se não encontrou configuração específica, usar padrão do profissional
    IF NOT FOUND THEN
      SELECT percentual_comissao_padrao INTO percentual_aplicado
      FROM profissionais
      WHERE id = NEW.profissional_id;
      
      percentual_aplicado := COALESCE(percentual_aplicado, 0);
    ELSE
      percentual_aplicado := config_comissao.valor_comissao;
    END IF;
    
    -- Calcular valor da comissão
    valor_comissao := (NEW.total_final * percentual_aplicado) / 100;
    
    -- Registrar comissão
    INSERT INTO comissoes (
      profissional_id,
      tipo_origem,
      origem_id,
      valor_base,
      percentual_comissao,
      valor_comissao,
      data_referencia
    ) VALUES (
      NEW.profissional_id,
      'venda',
      NEW.id,
      NEW.total_final,
      percentual_aplicado,
      valor_comissao,
      NEW.data_venda::date
    );
    
    -- Buscar nome do profissional
    SELECT nome INTO profissional_nome
    FROM profissionais
    WHERE id = NEW.profissional_id;
    
    -- Registrar comissão no fluxo de caixa
    INSERT INTO fluxo_caixa (
      data,
      tipo,
      categoria,
      descricao,
      valor,
      origem_tipo,
      origem_id,
      profissional_nome,
      metadata
    ) VALUES (
      NEW.data_venda::date,
      'saida',
      'Comissões',
      'Comissão - ' || COALESCE(profissional_nome, 'Profissional'),
      valor_comissao,
      'comissao_venda',
      NEW.id,
      profissional_nome,
      jsonb_build_object(
        'venda_id', NEW.id,
        'profissional_id', NEW.profissional_id,
        'percentual', percentual_aplicado,
        'valor_base', NEW.total_final
      )
    );
    
    RAISE NOTICE 'Comissão de venda calculada: % para profissional %', valor_comissao, profissional_nome;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cálculo automático de comissões
DROP TRIGGER IF EXISTS trigger_calcular_comissao_agendamento ON agendamentos;
CREATE TRIGGER trigger_calcular_comissao_agendamento
  AFTER INSERT OR UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_comissao_agendamento();

DROP TRIGGER IF EXISTS trigger_calcular_comissao_venda ON vendas;
CREATE TRIGGER trigger_calcular_comissao_venda
  AFTER INSERT OR UPDATE ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION calcular_comissao_venda();

-- Função para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_configuracoes_comissao_updated_at 
  BEFORE UPDATE ON public.configuracoes_comissao 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comissoes_updated_at 
  BEFORE UPDATE ON public.comissoes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profissionais_updated_at 
  BEFORE UPDATE ON public.profissionais 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns profissionais de exemplo
INSERT INTO public.profissionais (nome, email, telefone, especialidades, percentual_comissao_padrao) VALUES
('Marcos Mariano', 'marcos@salon.com', '(11) 99999-9999', '{"Cortes", "Coloração", "Hidratação"}', 40),
('Ana Silva', 'ana@salon.com', '(11) 88888-8888', '{"Finalização", "Hidratação"}', 35)
ON CONFLICT (email) DO NOTHING;

-- Habilitar realtime nas novas tabelas
ALTER TABLE public.configuracoes_comissao REPLICA IDENTITY FULL;
ALTER TABLE public.comissoes REPLICA IDENTITY FULL;
ALTER TABLE public.profissionais REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracoes_comissao;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comissoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profissionais;
