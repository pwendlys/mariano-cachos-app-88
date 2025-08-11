
-- 1) Tabela para configurar o banner
create table if not exists public.banner_settings (
  id text primary key,
  title text not null,
  subtitle text not null,
  description text not null,
  image_url text,
  logo_url text,
  image_meta jsonb not null default '{}'::jsonb, -- exemplo: {"crop": {"x": 0, "y": 0}, "zoom": 1.2, "aspect": 2}
  logo_meta jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atualiza o updated_at automaticamente nas alterações
drop trigger if exists tr_banner_settings_updated_at on public.banner_settings;
create trigger tr_banner_settings_updated_at
before update on public.banner_settings
for each row execute function public.update_updated_at_column();

-- Habilita RLS
alter table public.banner_settings enable row level security;

-- Políticas: leitura pública; gestão apenas admin
drop policy if exists "Public can read banner settings" on public.banner_settings;
create policy "Public can read banner settings"
  on public.banner_settings
  for select
  using (true);

drop policy if exists "Admin can manage banner settings" on public.banner_settings;
create policy "Admin can manage banner settings"
  on public.banner_settings
  for all
  using (
    exists (
      select 1
      from public.usuarios u
      where u.id = auth.uid() and u.tipo = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.usuarios u
      where u.id = auth.uid() and u.tipo = 'admin'
    )
  );

-- Registro padrão
insert into public.banner_settings (id, title, subtitle, description, is_visible)
values (
  'main-banner',
  'Marcos Mariano',
  'Expert em Crespos e Cacheados',
  'Sua beleza natural merece ser celebrada. Aqui, cada cacho tem sua história e personalidade única.',
  true
)
on conflict (id) do nothing;

-- 2) Bucket de storage para o banner (público)
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'banner') then
    insert into storage.buckets (id, name, public) values ('banner', 'banner', true);
  end if;
end $$;

-- Políticas no storage.objects para o bucket 'banner'
-- Leitura pública
drop policy if exists "Public read banner bucket" on storage.objects;
create policy "Public read banner bucket"
  on storage.objects
  for select
  using (bucket_id = 'banner');

-- Inserir apenas admin
drop policy if exists "Admin insert banner bucket" on storage.objects;
create policy "Admin insert banner bucket"
  on storage.objects
  for insert
  with check (
    bucket_id = 'banner'
    and exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.tipo = 'admin'
    )
  );

-- Atualizar apenas admin
drop policy if exists "Admin update banner bucket" on storage.objects;
create policy "Admin update banner bucket"
  on storage.objects
  for update
  using (
    bucket_id = 'banner'
    and exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.tipo = 'admin'
    )
  )
  with check (
    bucket_id = 'banner'
    and exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.tipo = 'admin'
    )
  );

-- Deletar apenas admin
drop policy if exists "Admin delete banner bucket" on storage.objects;
create policy "Admin delete banner bucket"
  on storage.objects
  for delete
  using (
    bucket_id = 'banner'
    and exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.tipo = 'admin'
    )
  );
