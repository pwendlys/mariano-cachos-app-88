
-- Corrigir função que registra agendamentos no fluxo de caixa
CREATE OR REPLACE FUNCTION public.registrar_agendamento_fluxo_caixa()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  cliente_nome_var TEXT;
  servico_nome_var TEXT;
  servico_preco NUMERIC;
  valor_final NUMERIC;
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
    
    -- Determinar valor final (usar valor do agendamento ou preço do serviço)
    valor_final := COALESCE(NEW.valor, servico_preco);
    
    -- Só registrar se o valor for positivo e válido
    IF valor_final IS NOT NULL AND valor_final > 0 THEN
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
        COALESCE(servico_nome_var, 'Serviço') || ' - ' || COALESCE(cliente_nome_var, 'Cliente não identificado'),
        valor_final,
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
      RAISE NOTICE 'Agendamento registrado no fluxo de caixa: % - R$ %', servico_nome_var, valor_final;
    ELSE
      RAISE NOTICE 'Agendamento % não registrado no fluxo de caixa - valor inválido: %', NEW.id, valor_final;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Corrigir função de validação para ser menos restritiva
CREATE OR REPLACE FUNCTION public.validar_agendamento_concluido()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  servico_preco NUMERIC;
BEGIN
  -- Se estamos marcando como concluído, garantir que tem valor válido
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    
    -- Se não tem valor, buscar o preço do serviço
    IF NEW.valor IS NULL OR NEW.valor <= 0 THEN
      SELECT preco INTO servico_preco
      FROM servicos
      WHERE id = NEW.servico_id;
      
      -- Só atualizar se encontrou um preço válido
      IF servico_preco IS NOT NULL AND servico_preco > 0 THEN
        NEW.valor := servico_preco;
      ELSE
        RAISE EXCEPTION 'Não é possível marcar agendamento como concluído: serviço sem preço definido';
      END IF;
    END IF;
    
    -- Validar se tem valor válido final
    IF NEW.valor IS NULL OR NEW.valor <= 0 THEN
      RAISE EXCEPTION 'Não é possível marcar agendamento como concluído sem valor válido';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Corrigir função de cálculo de comissão para evitar valores nulos
CREATE OR REPLACE FUNCTION public.calcular_comissao_agendamento()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  config_comissao RECORD;
  valor_comissao NUMERIC;
  percentual_aplicado NUMERIC;
  profissional_nome TEXT;
  servico_categoria TEXT;
  valor_base NUMERIC;
BEGIN
  -- Verificar se o status mudou para 'concluido' e tem profissional
  IF NEW.status = 'concluido' AND 
     NEW.profissional_id IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    
    -- Garantir que temos um valor base válido
    valor_base := COALESCE(NEW.valor, 0);
    
    -- Se não há valor base, não calcular comissão
    IF valor_base <= 0 THEN
      RAISE NOTICE 'Agendamento % não tem valor válido para calcular comissão', NEW.id;
      RETURN NEW;
    END IF;
    
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
    valor_comissao := (valor_base * percentual_aplicado) / 100;
    
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
        valor_base,
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
      
      -- Registrar comissão no fluxo de caixa somente se o valor é positivo
      IF valor_comissao > 0 THEN
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
            'valor_base', valor_base,
            'servico_categoria', servico_categoria
          )
        );
      END IF;
      
      RAISE NOTICE 'Comissão calculada: % para profissional % no agendamento %', valor_comissao, profissional_nome, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
