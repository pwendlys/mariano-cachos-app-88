
-- Criar função para sincronizar usuários do Supabase Auth com a tabela usuarios
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar na tabela usuarios quando um usuário é criado no auth
  INSERT INTO public.usuarios (
    id,
    nome,
    email,
    senha,
    tipo,
    ativo,
    whatsapp,
    avatar_url
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    'supabase_auth', -- Senha placeholder para usuários do Supabase Auth
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'cliente'),
    true,
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (email) DO UPDATE SET
    nome = COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', usuarios.nome),
    tipo = COALESCE(NEW.raw_user_meta_data->>'tipo', usuarios.tipo),
    ativo = true,
    whatsapp = COALESCE(NEW.raw_user_meta_data->>'whatsapp', usuarios.whatsapp),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', usuarios.avatar_url),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Criar trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- Criar função para sincronizar atualizações de usuários
CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Atualizar na tabela usuarios quando um usuário é atualizado no auth
  UPDATE public.usuarios SET
    nome = COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', usuarios.nome),
    email = NEW.email,
    tipo = COALESCE(NEW.raw_user_meta_data->>'tipo', usuarios.tipo),
    whatsapp = COALESCE(NEW.raw_user_meta_data->>'whatsapp', usuarios.whatsapp),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', usuarios.avatar_url),
    updated_at = now()
  WHERE email = OLD.email;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizações
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_updated();

-- Atualizar políticas RLS para trabalhar com Supabase Auth
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam/editem seus próprios dados
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
CREATE POLICY "Users can view their own profile" 
  ON public.usuarios 
  FOR SELECT 
  USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.usuarios;
CREATE POLICY "Users can update their own profile" 
  ON public.usuarios 
  FOR UPDATE 
  USING (
    auth.uid()::text = id::text OR 
    auth.email() = email
  );

-- Manter as políticas existentes para compatibilidade
-- (as políticas públicas existentes permanecem para o sistema customizado)
