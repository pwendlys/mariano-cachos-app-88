
-- Corrigir função que registra atendimento concluído no fluxo de caixa
CREATE OR REPLACE FUNCTION public.registrar_atendimento_concluido_fluxo_caixa()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  cliente_nome_var TEXT;
  profissional_nome_var TEXT;
  profissional_id_var UUID;
  servico_valor NUMERIC;
  produto_record RECORD;
  produto_custo NUMERIC;
  produto_nome TEXT;
  comissao_valor NUMERIC;
  percentual_comissao NUMERIC;
BEGIN
  -- Verificar se o status mudou para 'concluido'
  IF NEW.status = 'concluido' AND 
     (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    
    -- Buscar informações do cliente
    SELECT nome INTO cliente_nome_var
    FROM clientes
    WHERE id = NEW.cliente_id;
    
    -- Buscar profissional_id do agendamento se existe
    IF NEW.agendamento_id IS NOT NULL THEN
      SELECT profissional_id INTO profissional_id_var
      FROM agendamentos
      WHERE id = NEW.agendamento_id;
    END IF;
    
    -- Buscar informações do profissional se existe
    IF profissional_id_var IS NOT NULL THEN
      SELECT nome, percentual_comissao_padrao INTO profissional_nome_var, percentual_comissao
      FROM profissionais
      WHERE id = profissional_id_var;
      
      -- Garantir que percentual não seja nulo
      percentual_comissao := COALESCE(percentual_comissao, 0);
    ELSE
      percentual_comissao := 0;
    END IF;
    
    -- Registrar valor do agendamento como entrada
    IF NEW.agendamento_id IS NOT NULL THEN
      -- Buscar valor do serviço do agendamento
      SELECT COALESCE(a.valor, s.preco, 0) INTO servico_valor
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE a.id = NEW.agendamento_id;
      
      -- Só registrar se o valor for positivo
      IF servico_valor IS NOT NULL AND servico_valor > 0 THEN
        -- Registrar entrada do serviço
        INSERT INTO fluxo_caixa (
          data,
          tipo,
          categoria,
          descricao,
          valor,
          origem_tipo,
          origem_id,
          cliente_nome,
          profissional_nome,
          metadata
        ) VALUES (
          NEW.data_atendimento::date,
          'entrada',
          'Serviços',
          'Atendimento concluído - ' || COALESCE(cliente_nome_var, 'Cliente'),
          servico_valor,
          'atendimento',
          NEW.id,
          cliente_nome_var,
          profissional_nome_var,
          jsonb_build_object(
            'historico_id', NEW.id,
            'agendamento_id', NEW.agendamento_id,
            'profissional_id', profissional_id_var,
            'tipo', 'servico'
          )
        );
        
        -- Calcular e registrar comissão do serviço como saída
        IF profissional_nome_var IS NOT NULL AND percentual_comissao > 0 THEN
          comissao_valor := (servico_valor * percentual_comissao) / 100;
          
          IF comissao_valor > 0 THEN
            INSERT INTO fluxo_caixa (
              data,
              tipo,
              categoria,
              descricao,
              valor,
              origem_tipo,
              origem_id,
              cliente_nome,
              profissional_nome,
              metadata
            ) VALUES (
              NEW.data_atendimento::date,
              'saida',
              'Comissões',
              'Comissão serviço - ' || profissional_nome_var,
              comissao_valor,
              'comissao_atendimento',
              NEW.id,
              cliente_nome_var,
              profissional_nome_var,
              jsonb_build_object(
                'historico_id', NEW.id,
                'profissional_id', profissional_id_var,
                'tipo', 'comissao_servico',
                'percentual', percentual_comissao,
                'valor_base', servico_valor
              )
            );
          END IF;
        END IF;
      END IF;
    END IF;
    
    -- Processar produtos vendidos
    IF NEW.produtos_vendidos IS NOT NULL AND jsonb_array_length(NEW.produtos_vendidos) > 0 THEN
      FOR produto_record IN 
        SELECT 
          (item->>'id')::uuid as produto_id,
          COALESCE((item->>'quantidade')::integer, 1) as quantidade,
          COALESCE((item->>'preco')::numeric, 0) as preco_unitario
        FROM jsonb_array_elements(NEW.produtos_vendidos) as item
        WHERE (item->>'preco')::numeric > 0
      LOOP
        -- Buscar informações do produto
        SELECT nome, COALESCE(preco_custo, 0) INTO produto_nome, produto_custo
        FROM produtos
        WHERE id = produto_record.produto_id;
        
        -- Registrar entrada da venda do produto
        INSERT INTO fluxo_caixa (
          data,
          tipo,
          categoria,
          descricao,
          valor,
          origem_tipo,
          origem_id,
          cliente_nome,
          profissional_nome,
          metadata
        ) VALUES (
          NEW.data_atendimento::date,
          'entrada',
          'Produtos',
          'Venda produto - ' || COALESCE(produto_nome, 'Produto') || ' - ' || COALESCE(cliente_nome_var, 'Cliente'),
          produto_record.preco_unitario * produto_record.quantidade,
          'atendimento',
          NEW.id,
          cliente_nome_var,
          profissional_nome_var,
          jsonb_build_object(
            'historico_id', NEW.id,
            'produto_id', produto_record.produto_id,
            'produto_nome', produto_nome,
            'quantidade', produto_record.quantidade,
            'preco_unitario', produto_record.preco_unitario,
            'profissional_id', profissional_id_var,
            'tipo', 'venda_produto'
          )
        );
        
        -- Registrar custo do produto como saída
        IF produto_custo > 0 THEN
          INSERT INTO fluxo_caixa (
            data,
            tipo,
            categoria,
            descricao,
            valor,
            origem_tipo,
            origem_id,
            cliente_nome,
            profissional_nome,
            metadata
          ) VALUES (
            NEW.data_atendimento::date,
            'saida',
            'Custos',
            'Custo produto - ' || COALESCE(produto_nome, 'Produto'),
            produto_custo * produto_record.quantidade,
            'custo_produto',
            NEW.id,
            cliente_nome_var,
            profissional_nome_var,
            jsonb_build_object(
              'historico_id', NEW.id,
              'produto_id', produto_record.produto_id,
              'produto_nome', produto_nome,
              'quantidade', produto_record.quantidade,
              'custo_unitario', produto_custo,
              'profissional_id', profissional_id_var,
              'tipo', 'custo_produto'
            )
          );
        END IF;
        
        -- Calcular e registrar comissão do produto como saída
        IF profissional_nome_var IS NOT NULL AND percentual_comissao > 0 THEN
          comissao_valor := ((produto_record.preco_unitario * produto_record.quantidade) * percentual_comissao) / 100;
          
          IF comissao_valor > 0 THEN
            INSERT INTO fluxo_caixa (
              data,
              tipo,
              categoria,
              descricao,
              valor,
              origem_tipo,
              origem_id,
              cliente_nome,
              profissional_nome,
              metadata
            ) VALUES (
              NEW.data_atendimento::date,
              'saida',
              'Comissões',
              'Comissão produto - ' || profissional_nome_var || ' - ' || COALESCE(produto_nome, 'Produto'),
              comissao_valor,
              'comissao_produto',
              NEW.id,
              cliente_nome_var,
              profissional_nome_var,
              jsonb_build_object(
                'historico_id', NEW.id,
                'produto_id', produto_record.produto_id,
                'produto_nome', produto_nome,
                'profissional_id', profissional_id_var,
                'tipo', 'comissao_produto',
                'percentual', percentual_comissao,
                'valor_base', produto_record.preco_unitario * produto_record.quantidade
              )
            );
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    -- Processar serviços extras
    IF NEW.servicos_extras IS NOT NULL AND jsonb_array_length(NEW.servicos_extras) > 0 THEN
      FOR produto_record IN 
        SELECT 
          (item->>'id')::uuid as servico_id,
          COALESCE((item->>'preco')::numeric, 0) as preco,
          (item->>'nome')::text as nome
        FROM jsonb_array_elements(NEW.servicos_extras) as item
        WHERE (item->>'preco')::numeric > 0
      LOOP
        -- Registrar entrada do serviço extra
        INSERT INTO fluxo_caixa (
          data,
          tipo,
          categoria,
          descricao,
          valor,
          origem_tipo,
          origem_id,
          cliente_nome,
          profissional_nome,
          metadata
        ) VALUES (
          NEW.data_atendimento::date,
          'entrada',
          'Serviços',
          'Serviço extra - ' || COALESCE(produto_record.nome, 'Serviço') || ' - ' || COALESCE(cliente_nome_var, 'Cliente'),
          produto_record.preco,
          'atendimento',
          NEW.id,
          cliente_nome_var,
          profissional_nome_var,
          jsonb_build_object(
            'historico_id', NEW.id,
            'servico_id', produto_record.servico_id,
            'servico_nome', produto_record.nome,
            'profissional_id', profissional_id_var,
            'tipo', 'servico_extra'
          )
        );
        
        -- Calcular e registrar comissão do serviço extra como saída
        IF profissional_nome_var IS NOT NULL AND percentual_comissao > 0 THEN
          comissao_valor := (produto_record.preco * percentual_comissao) / 100;
          
          IF comissao_valor > 0 THEN
            INSERT INTO fluxo_caixa (
              data,
              tipo,
              categoria,
              descricao,
              valor,
              origem_tipo,
              origem_id,
              cliente_nome,
              profissional_nome,
              metadata
            ) VALUES (
              NEW.data_atendimento::date,
              'saida',
              'Comissões',
              'Comissão serviço extra - ' || profissional_nome_var || ' - ' || COALESCE(produto_record.nome, 'Serviço'),
              comissao_valor,
              'comissao_servico_extra',
              NEW.id,
              cliente_nome_var,
              profissional_nome_var,
              jsonb_build_object(
                'historico_id', NEW.id,
                'servico_id', produto_record.servico_id,
                'servico_nome', produto_record.nome,
                'profissional_id', profissional_id_var,
                'tipo', 'comissao_servico_extra',
                'percentual', percentual_comissao,
                'valor_base', produto_record.preco
              )
            );
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    RAISE NOTICE 'Atendimento % registrado no fluxo de caixa', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Também vamos corrigir a função de validação para ser menos restritiva
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
        -- Em vez de dar erro, vamos permitir valor 0
        NEW.valor := 0;
        RAISE NOTICE 'Agendamento % marcado como concluído com valor 0 - serviço sem preço definido', NEW.id;
      END IF;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para a função de validação se não existir
DROP TRIGGER IF EXISTS trigger_validar_agendamento_concluido ON agendamentos;
CREATE TRIGGER trigger_validar_agendamento_concluido
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION validar_agendamento_concluido();

-- Criar trigger para registrar no fluxo de caixa se não existir
DROP TRIGGER IF EXISTS trigger_registrar_atendimento_concluido_fluxo_caixa ON historico_atendimentos;
CREATE TRIGGER trigger_registrar_atendimento_concluido_fluxo_caixa
    AFTER UPDATE ON historico_atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_atendimento_concluido_fluxo_caixa();
