
-- Add data_cobranca column to saldos_clientes table
ALTER TABLE public.saldos_clientes 
ADD COLUMN data_cobranca DATE;

-- Create an index for better performance when ordering by collection date
CREATE INDEX idx_saldos_clientes_data_cobranca ON public.saldos_clientes(data_cobranca);

-- Update the trigger function to handle the updated_at timestamp
CREATE OR REPLACE FUNCTION update_saldos_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS trigger_saldos_clientes_updated_at ON public.saldos_clientes;
CREATE TRIGGER trigger_saldos_clientes_updated_at
  BEFORE UPDATE ON public.saldos_clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_saldos_clientes_updated_at();
