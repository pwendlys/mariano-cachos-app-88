
-- Adicionar coluna para controlar status de cobrança nos agendamentos
ALTER TABLE agendamentos 
ADD COLUMN status_cobranca TEXT DEFAULT 'pendente' CHECK (status_cobranca IN ('pendente', 'cobrado', 'pago'));

-- Criar índice para melhor performance
CREATE INDEX idx_agendamentos_status_cobranca ON agendamentos(status_cobranca);

-- Atualizar agendamentos existentes baseado no status atual
UPDATE agendamentos 
SET status_cobranca = CASE 
  WHEN status = 'concluido' AND status_pagamento = 'pago' THEN 'pago'
  WHEN status = 'concluido' THEN 'cobrado'
  ELSE 'pendente'
END;
