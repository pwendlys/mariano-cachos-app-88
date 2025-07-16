
-- Remover as políticas antigas que dependem de auth.uid()
DROP POLICY IF EXISTS "Produtos visíveis para todos" ON public.produtos;
DROP POLICY IF EXISTS "Apenas admin pode gerenciar produtos" ON public.produtos;

-- Criar novas políticas que funcionam com o sistema de auth customizado
-- Permitir leitura pública de produtos ativos (controle feito na aplicação)
CREATE POLICY "Permitir leitura publica de produtos" 
ON public.produtos 
FOR SELECT 
USING (ativo = true);

-- Permitir todas as operações para produtos (controle feito na aplicação)
CREATE POLICY "Permitir gerenciamento publico de produtos"
ON public.produtos
FOR ALL
USING (true)
WITH CHECK (true);

-- Também vamos ajustar as políticas de movimentação de estoque para funcionar sem auth nativo
DROP POLICY IF EXISTS "Apenas admin pode ver movimentação" ON public.movimentacao_estoque;
DROP POLICY IF EXISTS "Apenas admin pode gerenciar movimentação" ON public.movimentacao_estoque;

-- Políticas públicas para movimentação de estoque (controle feito na aplicação)
CREATE POLICY "Permitir leitura publica de movimentacao_estoque"
ON public.movimentacao_estoque
FOR SELECT
USING (true);

CREATE POLICY "Permitir gerenciamento publico de movimentacao_estoque"
ON public.movimentacao_estoque
FOR ALL
USING (true)
WITH CHECK (true);
