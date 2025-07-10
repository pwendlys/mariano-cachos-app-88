
-- Criar enum para tipos de usuário
CREATE TYPE user_type AS ENUM ('admin', 'funcionario', 'cliente');

-- Criar enum para status de agendamento
CREATE TYPE appointment_status AS ENUM ('pendente', 'confirmado', 'em_andamento', 'finalizado', 'cancelado', 'no_show');

-- Atualizar tabela profiles para incluir novos campos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type user_type DEFAULT 'cliente';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS no_shows INTEGER DEFAULT 0;

-- Criar tabela para perfis de funcionários
CREATE TABLE IF NOT EXISTS employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialties TEXT[] DEFAULT '{}',
  commission_rate DECIMAL(5,2) DEFAULT 0,
  work_schedule JSONB,
  work_days INTEGER[] DEFAULT '{}', -- 0=domingo, 1=segunda, etc
  monthly_goal DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para perfis de clientes
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT,
  birth_date DATE,
  preferences JSONB DEFAULT '{}',
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  device_info TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Atualizar tabela de agendamentos para usar novos enums e campos
ALTER TABLE agendamentos ALTER COLUMN status TYPE appointment_status USING status::appointment_status;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES employee_profiles(id);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS no_show BOOLEAN DEFAULT false;

-- Criar tabela para disponibilidade dos profissionais
CREATE TABLE IF NOT EXISTS professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(full_name); -- assuming email is stored in full_name field
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_professional ON agendamentos(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_availability_date ON professional_availability(professional_id, date);

-- Habilitar RLS nas novas tabelas
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para employee_profiles
CREATE POLICY "Employees can view their own profile" ON employee_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.id = employee_profiles.user_id
    )
  );

CREATE POLICY "Admins can manage all employee profiles" ON employee_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Políticas RLS para client_profiles
CREATE POLICY "Clients can view their own profile" ON client_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.id = client_profiles.user_id
    )
  );

CREATE POLICY "Clients can update their own profile" ON client_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.id = client_profiles.user_id
    )
  );

CREATE POLICY "Staff can view client profiles" ON client_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('admin', 'funcionario')
    )
  );

-- Políticas RLS para user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para professional_availability
CREATE POLICY "Everyone can view availability" ON professional_availability
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Professionals can manage their availability" ON professional_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employee_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.id = auth.uid() 
      AND ep.id = professional_availability.professional_id
    )
  );

CREATE POLICY "Admins can manage all availability" ON professional_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_employee_profiles_updated_at BEFORE UPDATE ON employee_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para criar perfil automático após cadastro
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil baseado no tipo de usuário
  IF NEW.user_type = 'cliente' THEN
    INSERT INTO client_profiles (user_id) VALUES (NEW.id);
  ELSIF NEW.user_type = 'funcionario' THEN
    INSERT INTO employee_profiles (user_id) VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar perfil automaticamente
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
