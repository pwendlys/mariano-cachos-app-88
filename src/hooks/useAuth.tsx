
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  nome: string;
  email: string;
  tipo: 'cliente' | 'admin';
  whatsapp?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (nome: string, email: string, whatsapp: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Fetch user data from usuarios table
          const { data: userData, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', session.user.email)
            .eq('ativo', true)
            .single();

          if (userData && !error) {
            const authUser: AuthUser = {
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              tipo: userData.tipo as 'cliente' | 'admin',
              whatsapp: userData.whatsapp
            };
            setUser(authUser);
          } else {
            console.log('User not found in usuarios table or inactive');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', email);
      console.log('🔐 Current Supabase client:', supabase);
      
      // First check if user exists in usuarios table and get their info
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (userError || !userData) {
        console.log('User lookup error:', userError);
        setLoading(false);
        return { success: false, error: 'Usuário não encontrado ou inativo' };
      }

      // Check password (in production, use proper hashing)
      if (userData.senha !== senha) {
        console.log('Password mismatch');
        setLoading(false);
        return { success: false, error: 'Senha incorreta' };
      }

      console.log('Credentials valid, signing in user:', userData.nome);

      // Sign in with Supabase Auth using a dummy password
      // This creates a proper Supabase session
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-password-for-session'
      });

      // If the user doesn't exist in Supabase Auth, create them
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('Creating new auth user');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: 'dummy-password-for-session',
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (signUpError) {
          console.error('Error creating auth user:', signUpError);
          setLoading(false);
          return { success: false, error: 'Erro ao criar sessão de autenticação' };
        }

        // If sign up was successful, the session will be handled by onAuthStateChange
        if (signUpData.user) {
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${userData.nome}!`,
          });
          return { success: true };
        }
      } else if (signInError) {
        console.error('Sign in error:', signInError);
        setLoading(false);
        return { success: false, error: 'Erro de autenticação' };
      }

      // If sign in was successful, the session will be handled by onAuthStateChange
      if (authData.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${userData.nome}!`,
        });
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Erro desconhecido' };

    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const register = async (nome: string, email: string, whatsapp: string, senha: string) => {
    try {
      setLoading(true);
      console.log('Attempting registration for:', email);
      
      // Check if user already exists in usuarios table
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        setLoading(false);
        return { success: false, error: 'E-mail já está em uso' };
      }

      // Insert user into usuarios table
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nome,
          email,
          whatsapp,
          senha, // In production, this should be hashed
          tipo: 'cliente'
        });

      if (insertError) {
        console.error('Error inserting into usuarios table:', insertError);
        setLoading(false);
        return { success: false, error: 'Erro ao cadastrar usuário' };
      }

      // Create Supabase Auth user
      const { error: authError } = await supabase.auth.signUp({
        email: email,
        password: 'dummy-password-for-session',
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        // Don't fail registration if auth creation fails
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você pode fazer login agora com suas credenciais.",
      });

      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const logout = async () => {
    console.log('Logging out');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
