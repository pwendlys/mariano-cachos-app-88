
-- Corrigir unicidade de produtos para considerar apenas itens ativos e ignorar diferenças de caixa e espaços

-- 1) Remover a constraint/índice único atual (se existir)
ALTER TABLE public.produtos
  DROP CONSTRAINT IF EXISTS unique_produto_nome_marca;

-- 2) Criar índice único parcial, case-insensitive e ignorando espaços, somente para produtos ativos
-- Isso mantém a unicidade entre produtos ATIVOS, mas permite novo cadastro se existir um inativo igual.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_produtos_nome_marca_ativo_ci
  ON public.produtos (lower(btrim(nome)), lower(btrim(marca)))
  WHERE ativo = true;
