
-- Adicionar campo tipo_produto na tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN tipo_produto TEXT NOT NULL DEFAULT 'ecommerce';

-- Adicionar constraint para validar os valores permitidos
ALTER TABLE public.produtos 
ADD CONSTRAINT produtos_tipo_produto_check 
CHECK (tipo_produto IN ('ecommerce', 'interno'));

-- Criar índice para melhorar performance nas consultas filtradas
CREATE INDEX idx_produtos_tipo_produto ON public.produtos(tipo_produto);

-- Atualizar produtos existentes para serem do tipo e-commerce por padrão
UPDATE public.produtos 
SET tipo_produto = 'ecommerce' 
WHERE tipo_produto IS NULL;
