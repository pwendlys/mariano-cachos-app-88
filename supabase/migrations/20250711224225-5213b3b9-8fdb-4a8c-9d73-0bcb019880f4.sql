
-- Criar tabela de produtos para o sistema de loja
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  marca TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2),
  estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 0,
  descricao TEXT,
  imagem TEXT,
  codigo_barras TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  duracao INTEGER NOT NULL, -- em minutos
  preco DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('corte', 'coloracao', 'tratamento', 'finalizacao', 'outros')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) NOT NULL,
  servico_id UUID REFERENCES public.servicos(id) NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('livre', 'pendente', 'ocupado', 'cancelado')),
  valor DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vendas
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id),
  total DECIMAL(10,2) NOT NULL,
  data_venda TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens da venda
CREATE TABLE IF NOT EXISTS public.itens_venda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de movimentação de estoque
CREATE TABLE IF NOT EXISTS public.movimentacao_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES public.produtos(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacao_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos (acesso público para leitura, apenas admin para escrita)
CREATE POLICY "Produtos visíveis para todos" ON public.produtos FOR SELECT USING (ativo = true);
CREATE POLICY "Apenas admin pode gerenciar produtos" ON public.produtos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Políticas para clientes (cada cliente vê apenas seus dados)
CREATE POLICY "Clientes podem ver seus dados" ON public.clientes FOR SELECT USING (
  email IN (SELECT email FROM public.usuarios WHERE id = auth.uid())
);
CREATE POLICY "Admin pode ver todos os clientes" ON public.clientes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Permitir criação de clientes" ON public.clientes FOR INSERT WITH CHECK (true);

-- Políticas para serviços (visíveis para todos, apenas admin gerencia)
CREATE POLICY "Serviços visíveis para todos" ON public.servicos FOR SELECT USING (ativo = true);
CREATE POLICY "Apenas admin pode gerenciar serviços" ON public.servicos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Políticas para agendamentos (cliente vê seus agendamentos, admin vê todos)
CREATE POLICY "Clientes podem ver seus agendamentos" ON public.agendamentos FOR SELECT USING (
  cliente_id IN (SELECT id FROM public.clientes WHERE email IN (SELECT email FROM public.usuarios WHERE id = auth.uid()))
);
CREATE POLICY "Admin pode ver todos os agendamentos" ON public.agendamentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Permitir criação de agendamentos" ON public.agendamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin pode gerenciar agendamentos" ON public.agendamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Políticas para vendas (cliente vê suas compras, admin vê todas)
CREATE POLICY "Clientes podem ver suas compras" ON public.vendas FOR SELECT USING (
  cliente_id IN (SELECT id FROM public.clientes WHERE email IN (SELECT email FROM public.usuarios WHERE id = auth.uid()))
);
CREATE POLICY "Admin pode ver todas as vendas" ON public.vendas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Admin pode gerenciar vendas" ON public.vendas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Políticas para itens de venda
CREATE POLICY "Itens de venda seguem política da venda" ON public.itens_venda FOR SELECT USING (
  venda_id IN (
    SELECT id FROM public.vendas WHERE 
    cliente_id IN (SELECT id FROM public.clientes WHERE email IN (SELECT email FROM public.usuarios WHERE id = auth.uid()))
    OR EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
  )
);
CREATE POLICY "Admin pode gerenciar itens de venda" ON public.itens_venda FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Políticas para movimentação de estoque (apenas admin)
CREATE POLICY "Apenas admin pode ver movimentação" ON public.movimentacao_estoque FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Apenas admin pode gerenciar movimentação" ON public.movimentacao_estoque FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo = 'admin')
);

-- Inserir alguns produtos de exemplo
INSERT INTO public.produtos (nome, marca, categoria, preco, preco_custo, estoque, estoque_minimo, descricao, imagem) VALUES
('Shampoo Hidratante Crespos', 'Salon Professional', 'shampoo', 89.90, 45.00, 15, 5, 'Limpeza suave para cabelos crespos e cacheados', '/lovable-uploads/62560d60-dd02-4d14-a219-49f2791caa7d.png'),
('Máscara Nutritiva Intensiva', 'Curly Care', 'mascara', 156.90, 78.00, 8, 3, 'Nutrição profunda para cachos definidos', '/lovable-uploads/3db478af-14c5-4827-b74f-11c73955a529.png'),
('Óleo Finalizador Natural', 'Natural Curls', 'oleo', 67.90, 34.00, 12, 4, 'Finalização com brilho natural', '/lovable-uploads/81d52047-99e1-4419-95b9-ed9915ea285c.png'),
('Creme Para Pentear Cachos', 'Curl Definition', 'creme', 45.90, 23.00, 20, 6, 'Define e controla o frizz dos cachos', '/lovable-uploads/62560d60-dd02-4d14-a219-49f2791caa7d.png')
ON CONFLICT DO NOTHING;

-- Inserir alguns serviços de exemplo
INSERT INTO public.servicos (nome, duracao, preco, categoria) VALUES
('Corte Feminino', 60, 80.00, 'corte'),
('Hidratação Profunda', 90, 120.00, 'tratamento'),
('Coloração Natural', 180, 200.00, 'coloracao'),
('Finalização Cachos', 45, 60.00, 'finalizacao'),
('Progressiva', 240, 350.00, 'tratamento')
ON CONFLICT DO NOTHING;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON public.vendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
