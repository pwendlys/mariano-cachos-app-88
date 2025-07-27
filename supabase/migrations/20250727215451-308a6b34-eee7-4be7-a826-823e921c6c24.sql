
-- First, let's check if we have the trigger for automatic commission calculation
-- This trigger should fire when an appointment status changes to 'concluido'

-- Drop existing trigger if it exists to recreate it properly
DROP TRIGGER IF EXISTS trigger_calcular_comissao_agendamento ON agendamentos;

-- Create or replace the function for calculating commissions on appointments
CREATE OR REPLACE FUNCTION calcular_comissao_agendamento()
RETURNS TRIGGER AS $$
DECLARE
  config_comissao RECORD;
  valor_comissao NUMERIC;
  percentual_aplicado NUMERIC;
  profissional_nome TEXT;
  servico_categoria TEXT;
BEGIN
  -- Verificar se o status mudou para 'concluido' e tem profissional
  IF NEW.status = 'concluido' AND 
     NEW.profissional_id IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    
    -- Buscar categoria do serviço
    SELECT categoria INTO servico_categoria
    FROM servicos
    WHERE id = NEW.servico_id;
    
    -- Buscar configuração de comissão do profissional para a categoria específica
    SELECT * INTO config_comissao
    FROM configuracoes_comissao cc
    WHERE cc.profissional_id = NEW.profissional_id
      AND cc.ativo = true
      AND (cc.categoria_servico = servico_categoria OR cc.categoria_servico IS NULL)
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
    
    -- Verificar se já existe comissão para este agendamento
    IF NOT EXISTS (
      SELECT 1 FROM comissoes 
      WHERE tipo_origem = 'agendamento' AND origem_id = NEW.id
    ) THEN
      -- Registrar comissão
      INSERT INTO comissoes (
        profissional_id,
        tipo_origem,
        origem_id,
        valor_base,
        percentual_comissao,
        valor_comissao,
        data_referencia,
        status,
        observacoes
      ) VALUES (
        NEW.profissional_id,
        'agendamento',
        NEW.id,
        COALESCE(NEW.valor, 0),
        percentual_aplicado,
        valor_comissao,
        NEW.data,
        'calculada',
        'Comissão automática do agendamento'
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
          'valor_base', COALESCE(NEW.valor, 0),
          'servico_categoria', servico_categoria
        )
      );
      
      RAISE NOTICE 'Comissão calculada: % para profissional % no agendamento %', valor_comissao, profissional_nome, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_calcular_comissao_agendamento
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_comissao_agendamento();
