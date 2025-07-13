
-- Adicionar campos para chave PIX e comprovante na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS chave_pix_abacate TEXT,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Criar tabela para armazenar configurações do Abacate Pay
CREATE TABLE IF NOT EXISTS public.abacate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de configuração
ALTER TABLE public.abacate_config ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem configurações
CREATE POLICY "Admin pode gerenciar config abacate" ON public.abacate_config
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() AND usuarios.tipo = 'admin'
  ));
