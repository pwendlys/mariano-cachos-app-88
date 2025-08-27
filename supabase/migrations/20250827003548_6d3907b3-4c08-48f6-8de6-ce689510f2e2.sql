
-- 1) Garantir coluna updated_at na tabela vendas
ALTER TABLE public.vendas
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2) (Re)definir função genérica de updated_at (idempotente)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3) Recriar trigger BEFORE UPDATE em vendas para manter updated_at
DROP TRIGGER IF EXISTS update_vendas_updated_at ON public.vendas;
CREATE TRIGGER update_vendas_updated_at
BEFORE UPDATE ON public.vendas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Garantir triggers que registram a venda no fluxo de caixa, comissão e notificação
DROP TRIGGER IF EXISTS trg_registrar_venda_fluxo ON public.vendas;
CREATE TRIGGER trg_registrar_venda_fluxo
AFTER INSERT OR UPDATE OF status ON public.vendas
FOR EACH ROW
EXECUTE FUNCTION public.registrar_venda_fluxo_caixa();

DROP TRIGGER IF EXISTS trg_calcular_comissao_venda ON public.vendas;
CREATE TRIGGER trg_calcular_comissao_venda
AFTER INSERT OR UPDATE OF status ON public.vendas
FOR EACH ROW
EXECUTE FUNCTION public.calcular_comissao_venda();

DROP TRIGGER IF EXISTS trg_notify_purchase_completed ON public.vendas;
CREATE TRIGGER trg_notify_purchase_completed
AFTER INSERT OR UPDATE OF status ON public.vendas
FOR EACH ROW
EXECUTE FUNCTION public.notify_purchase_completed();
