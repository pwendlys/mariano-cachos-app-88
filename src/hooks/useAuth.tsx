
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
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (nome: string, email: string, whatsapp: string, senha: string, tipo?: 'cliente' | 'admin') => Promise<{ success: boolean; error?: string }>;
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

    // Configurar listener de mudanças de auth primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        await handleAuthUser(session.user, session);
      } else {
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
    });

    // Buscar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted && initialSession?.user) {
          await handleAuthUser(initialSession.user, initialSession);
        }
      } catch (error) {
        console.error('Erro ao buscar sessão inicial:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthUser = async (authUser: User, authSession: Session) => {
    try {
      // Buscar dados adicionais do usuário na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', authUser.email)
        .eq('ativo', true)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        // Se não encontrou na tabela usuarios, usar dados do auth
        setUser({
          id: authUser.id,
          nome: authUser.user_metadata?.nome || authUser.user_metadata?.name || 'Usuário',
          email: authUser.email || '',
          tipo: authUser.user_metadata?.tipo || 'cliente',
          whatsapp: authUser.user_metadata?.whatsapp,
          avatar_url: authUser.user_metadata?.avatar_url
        });
      } else {
        // Usar dados da tabela usuarios
        setUser({
          id: userData.id,
          nome: userData.nome,
          email: userData.email,
          tipo: userData.tipo as 'cliente' | 'admin',
          whatsapp: userData.whatsapp,
          avatar_url: userData.avatar_url
        });
      }

      setSession(authSession);
    } catch (error) {
      console.error('Erro ao processar usuário autenticado:', error);
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      
      // Primeiro tentar autenticação com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        // Se falhou no Supabase Auth, tentar sistema customizado para usuários antigos
        console.log('Tentando login customizado para usuário existente...');
        
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .eq('ativo', true)
          .single();

        if (userError || !userData) {
          return { success: false, error: 'E-mail ou senha incorretos' };
        }

        // Verificar senha customizada
        if (userData.senha !== senha && userData.senha !== 'supabase_auth') {
          return { success: false, error: 'E-mail ou senha incorretos' };
        }

        // Se o usuário existe na tabela usuarios mas não no auth, migrar
        if (userData.senha !== 'supabase_auth') {
          try {
            console.log('Migrando usuário para Supabase Auth...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: userData.email,
              password: senha,
              options: {
                data: {
                  nome: userData.nome,
                  tipo: userData.tipo,
                  whatsapp: userData.whatsapp,
                  avatar_url: userData.avatar_url
                }
              }
            });

            if (signUpError) {
              console.error('Erro ao migrar usuário:', signUpError);
              return { success: false, error: 'Erro ao migrar usuário. Tente novamente.' };
            }

            // Atualizar senha na tabela usuarios para indicar migração
            await supabase
              .from('usuarios')
              .update({ senha: 'supabase_auth' })
              .eq('id', userData.id);

            toast({
              title: "Login realizado com sucesso!",
              description: `Bem-vindo, ${userData.nome}! Sua conta foi migrada para o novo sistema.`,
            });

            return { success: true };
          } catch (migrationError) {
            console.error('Erro na migração:', migrationError);
            return { success: false, error: 'Erro ao migrar usuário' };
          }
        }

        return { success: false, error: 'E-mail ou senha incorretos' };
      }

      if (authData.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo!`,
        });
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, whatsapp: string, senha: string, tipo: 'cliente' | 'admin' = 'cliente') => {
    try {
      setLoading(true);
      
      // Usar Supabase Auth para criar o usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            tipo,
            whatsapp,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'E-mail já está em uso' };
        }
        console.error('Erro no cadastro Supabase Auth:', authError);
        return { success: false, error: authError.message || 'Erro ao cadastrar usuário' };
      }

      if (authData.user) {
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido no cadastro' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
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
