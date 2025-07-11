
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
      if (session) {
        // This will trigger the auth state change listener
        console.log('Existing session found:', session);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      
      // Check if user exists in usuarios table first
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Usuário não encontrado ou inativo' };
      }

      // For admin, check simple password (demo purposes)
      if (email === 'adm@adm.com' && senha === 'adm@2025') {
        // Sign in with Supabase Auth
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (signInError) {
          return { success: false, error: 'Erro ao fazer login' };
        }

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${userData.nome}!`,
        });

        return { success: true };
      } else {
        return { success: false, error: 'Senha incorreta' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, whatsapp: string, senha: string) => {
    try {
      setLoading(true);
      
      // Check if user already exists in usuarios table
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'E-mail já está em uso' };
      }

      // Sign up with Supabase Auth
      const redirectUrl = `${window.location.origin}/auth`;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome,
            whatsapp
          }
        }
      });

      if (signUpError) {
        console.error('Erro ao cadastrar no Supabase Auth:', signUpError);
        return { success: false, error: 'Erro ao cadastrar usuário' };
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
        console.error('Erro ao inserir na tabela usuarios:', insertError);
        return { success: false, error: 'Erro ao cadastrar usuário' };
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar sua conta antes de fazer login.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    supabase.auth.signOut();
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
