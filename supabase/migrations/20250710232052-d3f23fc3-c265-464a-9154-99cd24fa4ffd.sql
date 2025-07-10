
-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  marca TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2),
  estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 5,
  descricao TEXT,
  imagem TEXT,
  codigo_barras TEXT UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de vendas
CREATE TABLE public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id),
  total DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  total_final DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de itens da venda
CREATE TABLE public.itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de movimentação de estoque
CREATE TABLE public.movimentacao_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id),
  tipo TEXT NOT NULL, -- 'entrada' ou 'saida'
  quantidade INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  observacoes TEXT,
  usuario_id UUID,
  venda_id UUID REFERENCES public.vendas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacao_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir acesso público (ajustar conforme necessário)
CREATE POLICY "Permitir leitura de produtos ativos" ON public.produtos
  FOR SELECT USING (ativo = true);

CREATE POLICY "Permitir acesso total para vendas" ON public.vendas
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso total para itens_venda" ON public.itens_venda
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso total para movimentacao_estoque" ON public.movimentacao_estoque
  FOR ALL USING (true) WITH CHECK (true);

-- Inserir alguns produtos de exemplo
INSERT INTO public.produtos (nome, marca, categoria, preco, preco_custo, estoque, estoque_minimo, descricao, codigo_barras) VALUES
  ('Shampoo Hidratante Crespos', 'Salon Professional', 'shampoo', 89.90, 45.00, 15, 5, 'Limpeza suave para cabelos crespos e cacheados', '7891234567890'),
  ('Máscara Nutritiva Intensiva', 'Curly Care', 'mascara', 156.90, 78.00, 8, 3, 'Nutrição profunda para cachos definidos', '7891234567891'),
  ('Óleo Finalizador Natural', 'Natural Curls', 'oleo', 67.90, 35.00, 12, 4, 'Finalização com brilho natural', '7891234567892'),
  ('Creme Para Pentear Cachos', 'Curl Definition', 'creme', 45.90, 25.00, 20, 6, 'Define e controla o frizz dos cachos', '7891234567893'),
  ('Condicionador Reparador', 'Repair Pro', 'condicionador', 72.90, 38.00, 18, 5, 'Repara e fortalece fios danificados', '7891234567894');

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_vendas_updated_at
  BEFORE UPDATE ON public.vendas
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para movimentação automática de estoque após venda
CREATE OR REPLACE FUNCTION public.handle_venda_estoque()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finalizada' AND OLD.status != 'finalizada' THEN
    -- Registrar saída de estoque para cada item da venda
    INSERT INTO public.movimentacao_estoque (produto_id, tipo, quantidade, motivo, venda_id)
    SELECT 
      iv.produto_id,
      'saida',
      iv.quantidade,
      'Venda finalizada',
      NEW.id
    FROM public.itens_venda iv
    WHERE iv.venda_id = NEW.id;
    
    -- Atualizar estoque dos produtos
    UPDATE public.produtos 
    SET estoque = estoque - iv.quantidade
    FROM public.itens_venda iv
    WHERE iv.venda_id = NEW.id AND produtos.id = iv.produto_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_venda_estoque_trigger
  AFTER UPDATE ON public.vendas
  FOR EACH ROW EXECUTE PROCEDURE public.handle_venda_estoque();
