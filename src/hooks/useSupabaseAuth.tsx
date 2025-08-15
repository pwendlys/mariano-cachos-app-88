
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
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nome: string, email: string, whatsapp: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  registerWithSupabase: (nome: string, email: string, whatsapp: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch user data from usuarios table
          setTimeout(() => {
            fetchUserData(session.user.id, session.user.email!);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email!);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string, email: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (!error && userData) {
        setUser({
          id: userData.id,
          nome: userData.nome,
          email: userData.email,
          tipo: userData.tipo as 'cliente' | 'admin',
          whatsapp: userData.whatsapp,
          avatar_url: userData.avatar_url
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  // Login com sistema customizado (compatibilidade)
  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Usuário não encontrado ou inativo' };
      }

      if (userData.senha !== senha && userData.senha !== 'supabase_auth') {
        return { success: false, error: 'Senha incorreta' };
      }

      // Se senha é 'supabase_auth', redirecionar para login com Supabase
      if (userData.senha === 'supabase_auth') {
        return { success: false, error: 'Use o sistema de recuperação de senha para definir uma nova senha' };
      }

      // Criar sessão falsa para compatibilidade
      const fakeUser = {
        id: userData.id,
        email: userData.email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        app_metadata: {},
        user_metadata: {
          nome: userData.nome,
          tipo: userData.tipo,
          whatsapp: userData.whatsapp,
          avatar_url: userData.avatar_url
        }
      } as User;

      const fakeSession = {
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: fakeUser
      } as Session;

      setSession(fakeSession);
      setUser({
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        tipo: userData.tipo as 'cliente' | 'admin',
        whatsapp: userData.whatsapp,
        avatar_url: userData.avatar_url
      });

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

  // Login com Supabase Auth
  const loginWithSupabase = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  // Registro com sistema customizado (compatibilidade)
  const register = async (nome: string, email: string, whatsapp: string, senha: string) => {
    try {
      setLoading(true);
      
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'E-mail já está em uso' };
      }

      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nome,
          email,
          whatsapp,
          senha,
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

  // Registro com Supabase Auth
  const registerWithSupabase = async (nome: string, email: string, whatsapp: string, password: string) => {
    try {
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome,
            whatsapp,
            tipo: 'cliente'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  // Recuperação de senha
  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?action=reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para o link de recuperação.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro na recuperação:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  // Atualizar senha
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      return { success: false, error: 'Erro interno do sistema' };
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
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      loginWithSupabase,
      register, 
      registerWithSupabase,
      resetPassword,
      updatePassword,
      logout, 
      updateUserAvatar, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth deve ser usado dentro de um SupabaseAuthProvider');
  }
  return context;
};
