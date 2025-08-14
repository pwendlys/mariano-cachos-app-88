
-- Adicionar campos para produtos em destaque
ALTER TABLE produtos 
ADD COLUMN em_destaque BOOLEAN DEFAULT false,
ADD COLUMN ordem_destaque INTEGER DEFAULT 0;

-- Criar índice para melhorar performance nas consultas de produtos em destaque
CREATE INDEX idx_produtos_destaque ON produtos(em_destaque, ordem_destaque) WHERE em_destaque = true;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN produtos.em_destaque IS 'Indica se o produto deve aparecer no banner rotativo de destaque';
COMMENT ON COLUMN produtos.ordem_destaque IS 'Ordem de exibição no banner rotativo (menor número = primeira posição)';
