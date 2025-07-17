
-- Criar tabela para notificações
CREATE TABLE public.notificacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('agendamento_aprovado', 'compra_concluida')),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  lida boolean DEFAULT false,
  data_criacao timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias notificações
CREATE POLICY "Usuarios podem ver suas notificacoes" 
  ON public.notificacoes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários marcarem suas notificações como lidas
CREATE POLICY "Usuarios podem atualizar suas notificacoes" 
  ON public.notificacoes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para permitir inserção de notificações (sistema)
CREATE POLICY "Sistema pode criar notificacoes" 
  ON public.notificacoes 
  FOR INSERT 
  WITH CHECK (true);

-- Função para criar notificação quando agendamento é aprovado
CREATE OR REPLACE FUNCTION notify_appointment_approved()
RETURNS TRIGGER AS $$
DECLARE
  client_user_id uuid;
  service_name text;
  appointment_date text;
BEGIN
  -- Verificar se o status mudou para 'confirmado'
  IF NEW.status = 'confirmado' AND OLD.status != 'confirmado' THEN
    -- Buscar o user_id do cliente baseado no email
    SELECT u.id INTO client_user_id
    FROM usuarios u
    JOIN clientes c ON c.email = u.email
    WHERE c.id = NEW.cliente_id;
    
    -- Buscar nome do serviço
    SELECT nome INTO service_name
    FROM servicos
    WHERE id = NEW.servico_id;
    
    -- Formatar data do agendamento
    appointment_date := to_char(NEW.data, 'DD/MM/YYYY') || ' às ' || NEW.horario;
    
    -- Criar notificação se encontrou o usuário
    IF client_user_id IS NOT NULL THEN
      INSERT INTO notificacoes (
        user_id,
        tipo,
        titulo,
        mensagem,
        metadata
      ) VALUES (
        client_user_id,
        'agendamento_aprovado',
        'Agendamento Confirmado! ✅',
        'Seu agendamento para ' || service_name || ' foi confirmado para ' || appointment_date,
        jsonb_build_object(
          'agendamento_id', NEW.id,
          'servico_nome', service_name,
          'data', NEW.data,
          'horario', NEW.horario
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para agendamentos aprovados
CREATE TRIGGER trigger_appointment_approved
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_approved();

-- Função para criar notificação quando compra é finalizada
CREATE OR REPLACE FUNCTION notify_purchase_completed()
RETURNS TRIGGER AS $$
DECLARE
  client_user_id uuid;
  total_formatted text;
BEGIN
  -- Verificar se é uma nova venda finalizada
  IF NEW.status = 'finalizada' AND (OLD.status IS NULL OR OLD.status != 'finalizada') THEN
    -- Buscar o user_id do cliente baseado no email se cliente_id existe
    IF NEW.cliente_id IS NOT NULL THEN
      SELECT u.id INTO client_user_id
      FROM usuarios u
      JOIN clientes c ON c.email = u.email
      WHERE c.id = NEW.cliente_id;
      
      -- Formatar valor total
      total_formatted := 'R$ ' || to_char(NEW.total_final, 'FM999G999D00');
      
      -- Criar notificação se encontrou o usuário
      IF client_user_id IS NOT NULL THEN
        INSERT INTO notificacoes (
          user_id,
          tipo,
          titulo,
          mensagem,
          metadata
        ) VALUES (
          client_user_id,
          'compra_concluida',
          'Compra Finalizada! 🛍️',
          'Sua compra no valor de ' || total_formatted || ' foi processada com sucesso!',
          jsonb_build_object(
            'venda_id', NEW.id,
            'total', NEW.total_final,
            'data_compra', NEW.data_venda
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para compras finalizadas
CREATE TRIGGER trigger_purchase_completed
  AFTER INSERT OR UPDATE ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION notify_purchase_completed();
