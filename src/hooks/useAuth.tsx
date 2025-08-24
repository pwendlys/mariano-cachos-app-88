
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  nome: string;
  email: string;
  tipo: 'cliente' | 'admin' | 'convidado';
  whatsapp?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (nome: string, email: string, whatsapp: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => void;
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
      async (event, supabaseSession) => {
        console.log('Auth state change:', event, supabaseSession?.user?.email);
        setSession(supabaseSession);
        
        if (supabaseSession?.user) {
          // Try to get user data from our usuarios table
          const { data: userData, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', supabaseSession.user.email)
            .eq('ativo', true)
            .single();
          
          if (userData && !error) {
            const normalizedTipo = userData.tipo.toLowerCase().trim();
            const validTipos = ['cliente', 'admin', 'convidado'];
            const userTipo = validTipos.includes(normalizedTipo) ? normalizedTipo as 'cliente' | 'admin' | 'convidado' : 'cliente';
            
            setUser({
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              tipo: userTipo,
              whatsapp: userData.whatsapp,
              avatar_url: userData.avatar_url
            });
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!existingSession) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      
      // Check if user exists in usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Usuário não encontrado ou inativo' };
      }

      // Simple password validation (in production, use proper hashing)
      if (userData.senha !== senha) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Try to sign in with Supabase auth first
      let authResult = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
      });

      // If user doesn't exist in Supabase auth, create them
      if (authResult.error && (
        authResult.error.message.includes('Invalid login credentials') ||
        authResult.error.message.includes('User not found')
      )) {
        console.log('User not found in Supabase auth, creating account...');
        
        const signUpResult = await supabase.auth.signUp({
          email: email,
          password: senha,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (signUpResult.error) {
          console.error('Error creating Supabase user:', signUpResult.error);
          return { success: false, error: 'Erro ao criar conta no sistema de autenticação' };
        }

        // Try to sign in again after creating the account
        authResult = await supabase.auth.signInWithPassword({
          email: email,
          password: senha
        });
      }

      if (authResult.error) {
        console.error('Final auth error:', authResult.error);
        return { success: false, error: 'Erro na autenticação' };
      }

      // The auth state change listener will handle setting the user
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${userData.nome}!`,
      });

      return { success: true };
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
        description: "Você pode fazer login agora com suas credenciais.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({
        ...user,
        avatar_url: avatarUrl
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, updateUserAvatar, loading }}>
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
