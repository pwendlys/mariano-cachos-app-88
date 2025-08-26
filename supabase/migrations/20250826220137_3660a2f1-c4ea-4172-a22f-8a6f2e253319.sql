
-- 1) Tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id),
  user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando_confirmacao', -- 'aguardando_confirmacao' | 'confirmado' | 'cancelado'
  metodo_pagamento TEXT NOT NULL,                        -- 'pix' | 'cartao' | 'dinheiro'
  modalidade_entrega TEXT NOT NULL,                      -- 'retirada' | 'entrega'
  endereco_entrega JSONB,                                -- { cep, rua, numero, complemento, bairro, cidade, uf }
  observacoes TEXT,

  subtotal NUMERIC NOT NULL DEFAULT 0,
  desconto NUMERIC NOT NULL DEFAULT 0,
  frete_valor NUMERIC,
  juros_percentual NUMERIC,
  juros_valor NUMERIC,
  total_estimado NUMERIC NOT NULL DEFAULT 0,
  total_confirmado NUMERIC,
  cupom_id UUID REFERENCES public.cupons(id),

  itens JSONB NOT NULL DEFAULT '[]'::jsonb,              -- snapshot do carrinho [{id,name,brand,price,quantity,image}]

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem criar pedidos próprios (email do auth deve bater com user_email)
CREATE POLICY "Users can create their own pedidos"
  ON public.pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

-- Usuários podem ver seus próprios pedidos
CREATE POLICY "Users can view their own pedidos"
  ON public.pedidos
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

-- Admin pode gerenciar todos os pedidos
CREATE POLICY "Admin can manage all pedidos"
  ON public.pedidos
  FOR ALL
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- 3) Trigger para updated_at
CREATE TRIGGER trg_pedidos_set_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Índices úteis
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedidos_user_email ON public.pedidos(user_email);
