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
    let mounted = true;

    // Set up auth state listener - keep it synchronous to prevent loops
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, supabaseSession) => {
        if (!mounted) return;

        console.log('Auth state change:', event, supabaseSession?.user?.email);
        
        // Always update session state immediately
        setSession(supabaseSession);
        
        // Handle user data fetching asynchronously to prevent loops
        if (supabaseSession?.user) {
          // Defer user data fetching to prevent blocking the auth state change
          setTimeout(() => {
            if (!mounted) return;
            
            supabase
              .from('usuarios')
              .select('*')
              .eq('email', supabaseSession.user.email)
              .eq('ativo', true)
              .single()
              .then(({ data: userData, error }) => {
                if (!mounted) return;
                
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
                } else {
                  setUser(null);
                }
                setLoading(false);
              })
              .catch(() => {
                if (!mounted) return;
                setUser(null);
                setLoading(false);
              });
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return;
      if (!existingSession) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getErrorMessage = (error: any) => {
    if (!error?.message) return 'Erro desconhecido';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
      return 'E-mail ou senha incorretos';
    }
    if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
      return 'E-mail não confirmado. Verifique sua caixa de entrada';
    }
    if (message.includes('email_address_invalid')) {
      return 'Endereço de e-mail inválido';
    }
    if (message.includes('signup_disabled')) {
      return 'Cadastro desabilitado';
    }
    if (message.includes('too_many_requests')) {
      return 'Muitas tentativas. Tente novamente em alguns minutos';
    }
    
    return error.message;
  };

  const login = async (email: string, senha: string) => {
    try {
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

      // Simple password validation (in production, use proper hashing)
      if (userData.senha !== senha) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Try to sign in with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return { success: false, error: getErrorMessage(authError) };
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

      // Create user in Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário no Supabase Auth:', authError);
        return { success: false, error: getErrorMessage(authError) };
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
        description: "Verifique seu e-mail para confirmar a conta antes de fazer login.",
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
