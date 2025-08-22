
-- 1) Permitir DELETE em historico_atendimentos (seguindo o padrão do projeto)
-- Obs: RLS já está habilitado; só faltava a política de DELETE.
CREATE POLICY "Permitir exclusao de historico"
  ON public.historico_atendimentos
  FOR DELETE
  USING (true);

-- 2) Função para apagar lançamentos do fluxo_caixa quando um histórico for deletado
CREATE OR REPLACE FUNCTION public.cascade_delete_fluxo_caixa_from_historico()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remove quaisquer lançamentos no fluxo de caixa vinculados a este histórico,
  -- independente do tipo de origem (atendimento, comissao_*, custo_produto, etc.)
  DELETE FROM public.fluxo_caixa
  WHERE origem_id = OLD.id;

  RETURN OLD;
END;
$$;

-- 3) Trigger AFTER DELETE na tabela historico_atendimentos
DROP TRIGGER IF EXISTS trg_cascade_delete_fluxo_caixa_from_historico ON public.historico_atendimentos;

CREATE TRIGGER trg_cascade_delete_fluxo_caixa_from_historico
AFTER DELETE ON public.historico_atendimentos
FOR EACH ROW
EXECUTE FUNCTION public.cascade_delete_fluxo_caixa_from_historico();
