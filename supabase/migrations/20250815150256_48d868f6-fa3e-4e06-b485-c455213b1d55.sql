
-- 1) Função para verificar se o usuário atual é admin OU convidado
create or replace function public.is_admin_or_guest()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.email = current_setting('request.jwt.claims', true)::json->>'email'
      and u.ativo = true
      and u.tipo in ('admin', 'convidado')
  );
$$;

-- 2) Banner: permitir que admin ou convidado gerenciem (INSERT/UPDATE/DELETE/SELECT)
-- Mantém a policy pública de leitura já existente; acrescenta permissão de gestão a admin ou convidado
create policy "Admin or Guest can manage banner settings"
on public.banner_settings
for all
using (public.is_admin_or_guest())
with check (public.is_admin_or_guest());

-- 3) Galeria: permitir que admin ou convidado gerenciem (além da policy já existente de admin)
-- A tabela já possui SELECT público de fotos ativas; aqui liberamos gestão também para 'convidado'
create policy "Admin or Guest can manage gallery_photos"
on public.gallery_photos
for all
using (public.is_admin_or_guest())
with check (public.is_admin_or_guest());
