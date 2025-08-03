
-- Make divida_id nullable in cobrancas table to allow client balance collections
ALTER TABLE cobrancas ALTER COLUMN divida_id DROP NOT NULL;
