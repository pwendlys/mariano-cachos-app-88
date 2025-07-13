-- Add PIX payment and approval fields to agendamentos table
ALTER TABLE public.agendamentos 
ADD COLUMN status_pagamento text DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago', 'rejeitado')),
ADD COLUMN chave_pix text,
ADD COLUMN comprovante_pix text;