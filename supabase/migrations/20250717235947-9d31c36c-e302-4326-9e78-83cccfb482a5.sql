
-- Criar tabela para fluxo de caixa automático
CREATE TABLE public.fluxo_caixa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor > 0),
  origem_tipo TEXT, -- 'agendamento', 'venda', 'manual', etc
  origem_id UUID, -- ID da origem (agendamento_id, venda_id, etc)
  cliente_nome TEXT,
  profissional_nome TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura publica de fluxo_caixa" 
  ON public.fluxo_caixa 
  FOR SELECT 
  USING (true);

-- Política para permitir gerenciamento completo
CREATE POLICY "Permitir gerenciamento completo de fluxo_caixa" 
  ON public.fluxo_caixa 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_fluxo_caixa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_fluxo_caixa_updated_at_trigger
  BEFORE UPDATE ON public.fluxo_caixa
  FOR EACH ROW
  EXECUTE FUNCTION update_fluxo_caixa_updated_at();

-- Função para registrar agendamento no fluxo de caixa
CREATE OR REPLACE FUNCTION registrar_agendamento_fluxo_caixa()
RETURNS TRIGGER AS $$
DECLARE
  cliente_nome_var TEXT;
  servico_nome_var TEXT;
  servico_preco NUMERIC;
BEGIN
  -- Verificar se o status mudou para 'confirmado' ou 'concluido'
  IF NEW.status IN ('confirmado', 'concluido') AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('confirmado', 'concluido')) THEN
    
    -- Buscar informações do cliente
    SELECT nome INTO cliente_nome_var
    FROM clientes
    WHERE id = NEW.cliente_id;
    
    -- Buscar informações do serviço
    SELECT nome, preco INTO servico_nome_var, servico_preco
    FROM servicos
    WHERE id = NEW.servico_id;
    
    -- Registrar entrada no fluxo de caixa
    INSERT INTO fluxo_caixa (
      data,
      tipo,
      categoria,
      descricao,
      valor,
      origem_tipo,
      origem_id,
      cliente_nome,
      metadata
    ) VALUES (
      NEW.data,
      'entrada',
      'Serviços',
      servico_nome_var || ' - ' || COALESCE(cliente_nome_var, 'Cliente não identificado'),
      COALESCE(NEW.valor, servico_preco, 0),
      'agendamento',
      NEW.id,
      cliente_nome_var,
      jsonb_build_object(
        'agendamento_id', NEW.id,
        'servico_id', NEW.servico_id,
        'servico_nome', servico_nome_var,
        'horario', NEW.horario::text,
        'status', NEW.status
      )
    );
    
    -- Log para debug
    RAISE NOTICE 'Agendamento registrado no fluxo de caixa: % - R$ %', servico_nome_var, COALESCE(NEW.valor, servico_preco, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para agendamentos
DROP TRIGGER IF EXISTS trigger_registrar_agendamento_fluxo_caixa ON agendamentos;
CREATE TRIGGER trigger_registrar_agendamento_fluxo_caixa
  AFTER INSERT OR UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_agendamento_fluxo_caixa();

-- Função para registrar vendas no fluxo de caixa
CREATE OR REPLACE FUNCTION registrar_venda_fluxo_caixa()
RETURNS TRIGGER AS $$
DECLARE
  cliente_nome_var TEXT;
  total_itens INTEGER;
BEGIN
  -- Verificar se é uma nova venda finalizada
  IF NEW.status = 'finalizada' AND 
     (OLD IS NULL OR OLD.status != 'finalizada') THEN
    
    -- Buscar nome do cliente se existe
    IF NEW.cliente_id IS NOT NULL THEN
      SELECT nome INTO cliente_nome_var
      FROM clientes
      WHERE id = NEW.cliente_id;
    END IF;
    
    -- Contar itens da venda
    SELECT COUNT(*) INTO total_itens
    FROM itens_venda
    WHERE venda_id = NEW.id;
    
    -- Registrar entrada no fluxo de caixa
    INSERT INTO fluxo_caixa (
      data,
      tipo,
      categoria,
      descricao,
      valor,
      origem_tipo,
      origem_id,
      cliente_nome,
      metadata
    ) VALUES (
      NEW.data_venda::date,
      'entrada',
      'Produtos',
      'Venda de produtos (' || total_itens || ' itens)' || 
      CASE 
        WHEN cliente_nome_var IS NOT NULL THEN ' - ' || cliente_nome_var
        ELSE ' - Venda balcão'
      END,
      NEW.total_final,
      'venda',
      NEW.id,
      cliente_nome_var,
      jsonb_build_object(
        'venda_id', NEW.id,
        'total_bruto', NEW.total,
        'desconto', COALESCE(NEW.desconto, 0),
        'total_final', NEW.total_final,
        'total_itens', total_itens,
        'cupom_id', NEW.cupom_id
      )
    );
    
    -- Log para debug
    RAISE NOTICE 'Venda registrada no fluxo de caixa: Venda % - R$ %', NEW.id, NEW.total_final;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para vendas
DROP TRIGGER IF EXISTS trigger_registrar_venda_fluxo_caixa ON vendas;
CREATE TRIGGER trigger_registrar_venda_fluxo_caixa
  AFTER INSERT OR UPDATE ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION registrar_venda_fluxo_caixa();

-- Habilitar realtime na tabela fluxo_caixa
ALTER TABLE public.fluxo_caixa REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fluxo_caixa;
