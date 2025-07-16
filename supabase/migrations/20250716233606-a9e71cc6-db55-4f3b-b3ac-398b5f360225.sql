
-- Criar tabela de cupons
CREATE TABLE public.cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('percentual', 'valor_fixo')),
  valor NUMERIC NOT NULL,
  valor_minimo_compra NUMERIC DEFAULT 0,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  limite_uso INTEGER,
  usos_realizados INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (para validar cupons no frontend)
CREATE POLICY "Permitir leitura publica de cupons ativos" 
ON public.cupons 
FOR SELECT 
USING (ativo = true AND data_inicio <= CURRENT_DATE AND data_fim >= CURRENT_DATE);

-- Política para admin gerenciar cupons
CREATE POLICY "Admin pode gerenciar cupons" 
ON public.cupons 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios 
  WHERE usuarios.id = auth.uid() AND usuarios.tipo = 'admin'
));

-- Adicionar campos de cupom na tabela vendas
ALTER TABLE public.vendas 
ADD COLUMN cupom_id UUID REFERENCES public.cupons(id),
ADD COLUMN desconto NUMERIC DEFAULT 0,
ADD COLUMN total_final NUMERIC;

-- Atualizar vendas existentes com total_final igual ao total
UPDATE public.vendas SET total_final = total WHERE total_final IS NULL;

-- Tornar total_final obrigatório
ALTER TABLE public.vendas ALTER COLUMN total_final SET NOT NULL;

-- Trigger para atualizar updated_at em cupons
CREATE OR REPLACE FUNCTION update_cupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cupons_updated_at_trigger
  BEFORE UPDATE ON public.cupons
  FOR EACH ROW
  EXECUTE FUNCTION update_cupons_updated_at();
