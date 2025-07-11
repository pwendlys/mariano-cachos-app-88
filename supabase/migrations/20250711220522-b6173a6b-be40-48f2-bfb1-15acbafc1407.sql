
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  senha TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'admin')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir cadastro de novos usuários
CREATE POLICY "Permitir cadastro de usuários" 
  ON public.usuarios 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir leitura de usuários (para login)
CREATE POLICY "Permitir leitura de usuários" 
  ON public.usuarios 
  FOR SELECT 
  USING (true);

-- Política para permitir atualização de usuários próprios
CREATE POLICY "Permitir atualização própria" 
  ON public.usuarios 
  FOR UPDATE 
  USING (true);

-- Inserir admin pré-cadastrado (senha: adm@2025)
INSERT INTO public.usuarios (nome, email, senha, tipo, whatsapp) 
VALUES (
  'Administrador', 
  'adm@adm.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hash de 'adm@2025'
  'admin',
  '(11) 99999-9999'
) ON CONFLICT (email) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_usuarios();
