-- First, let's add any missing products from localStorage to Supabase
-- This migration handles the synchronization of product data

-- Add any missing columns or adjust existing ones if needed
-- Check if we need to add a unique constraint for nome+marca combination
ALTER TABLE produtos ADD CONSTRAINT unique_produto_nome_marca UNIQUE (nome, marca);

-- Insert default products if they don't exist (these match the localStorage defaults)
INSERT INTO produtos (nome, marca, categoria, preco, preco_custo, estoque, estoque_minimo, descricao, imagem)
VALUES 
  ('Shampoo Hidratante Crespos', 'Salon Professional', 'shampoo', 89.90, 45.00, 15, 5, 'Limpeza suave para cabelos crespos e cacheados', '/lovable-uploads/62560d60-dd02-4d14-a219-49f2791caa7d.png'),
  ('Máscara Nutritiva Intensiva', 'Curly Care', 'mascara', 156.90, 78.00, 8, 3, 'Nutrição profunda para cachos definidos', '/lovable-uploads/3db478af-14c5-4827-b74f-11c73955a529.png')
ON CONFLICT (nome, marca) DO NOTHING;