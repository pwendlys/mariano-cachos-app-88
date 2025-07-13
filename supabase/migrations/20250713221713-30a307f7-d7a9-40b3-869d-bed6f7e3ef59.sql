
-- Primeiro, vamos verificar os valores permitidos na constraint atual
-- e atualizar para incluir todos os status necessários
ALTER TABLE public.agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_status_check;

-- Criar nova constraint com todos os valores de status necessários
ALTER TABLE public.agendamentos 
ADD CONSTRAINT agendamentos_status_check 
CHECK (status IN ('pendente', 'confirmado', 'concluido', 'rejeitado'));

-- Também vamos garantir que a constraint de status_pagamento está correta
ALTER TABLE public.agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_status_pagamento_check;

ALTER TABLE public.agendamentos 
ADD CONSTRAINT agendamentos_status_pagamento_check 
CHECK (status_pagamento IN ('pendente', 'pago', 'rejeitado'));
