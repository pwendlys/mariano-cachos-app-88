
-- Enable real-time functionality for the produtos table
ALTER TABLE produtos REPLICA IDENTITY FULL;

-- Add the produtos table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE produtos;

-- Also enable real-time for movimentacao_estoque to track stock changes 
ALTER TABLE movimentacao_estoque REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE movimentacao_estoque;
