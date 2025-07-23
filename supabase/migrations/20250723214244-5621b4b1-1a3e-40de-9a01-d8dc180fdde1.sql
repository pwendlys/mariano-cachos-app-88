
-- Adicionar colunas para pagamento PIX na tabela vendas
ALTER TABLE public.vendas 
ADD COLUMN forma_pagamento text,
ADD COLUMN chave_pix text,
ADD COLUMN chave_pix_abacate text,
ADD COLUMN qr_code_data text,
ADD COLUMN transaction_id text,
ADD COLUMN status_pagamento text DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago', 'rejeitado'));
