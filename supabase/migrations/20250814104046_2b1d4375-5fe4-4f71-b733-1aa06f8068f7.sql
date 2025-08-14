
-- Adicionar campo para imagem de banner personalizada na tabela produtos
ALTER TABLE produtos ADD COLUMN imagem_banner text;

-- Atualizar comentário da tabela para documentar o novo campo
COMMENT ON COLUMN produtos.imagem_banner IS 'URL da imagem de fundo personalizada para o banner de produtos em destaque (dimensões recomendadas: 800x400px)';
