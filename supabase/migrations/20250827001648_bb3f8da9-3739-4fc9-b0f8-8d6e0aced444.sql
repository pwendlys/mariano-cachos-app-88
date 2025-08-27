
-- 1) Ajuste de RLS: usar validação de admin por e-mail (is_current_user_admin)

-- VENDAS
DROP POLICY IF EXISTS "Admin pode gerenciar vendas" ON public.vendas;
CREATE POLICY "Admin pode gerenciar vendas"
  ON public.vendas
  FOR ALL
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin pode ver todas as vendas" ON public.vendas;
CREATE POLICY "Admin pode ver todas as vendas"
  ON public.vendas
  FOR SELECT
  USING (public.is_current_user_admin());

-- Mantém a política de clientes verem suas compras
-- ("Clientes podem ver suas compras") sem alterações

-- ITENS_VENDA
DROP POLICY IF EXISTS "Admin pode gerenciar itens de venda" ON public.itens_venda;
CREATE POLICY "Admin pode gerenciar itens de venda"
  ON public.itens_venda
  FOR ALL
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- Mantém a política de SELECT por vínculo com a venda, já existente

-- 2) Triggers para registrar venda no fluxo de caixa, comissões e notificação

-- Garante recriação idempotente
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
