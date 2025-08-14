
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se há uma sessão ativa no Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          setIsAuthenticated(true);
          
          // Verificar se é admin na tabela usuarios
          const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('tipo, ativo')
            .eq('email', session.user.email)
            .eq('ativo', true)
            .single();

          if (error) {
            console.error('Erro ao verificar usuário:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(usuario?.tipo === 'admin');
          }
        } else {
          // Verificar autenticação via localStorage (sistema customizado)
          const localAuth = localStorage.getItem('supabase.auth.token');
          if (localAuth) {
            setIsAuthenticated(true);
            // Para sistema customizado, assumir admin por enquanto
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signInAsAdmin = async (email: string = 'admin@example.com', password: string = 'admin123') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Se não conseguir fazer login no Supabase, criar usuário temporário
        console.log('Tentando criar usuário admin temporário...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });

        if (signUpError) {
          console.error('Erro ao criar usuário:', signUpError);
          toast.error('Erro ao autenticar');
          return false;
        }

        // Criar entrada na tabela usuarios
        const { error: userError } = await supabase
          .from('usuarios')
          .insert([{
            email,
            nome: 'Administrador',
            tipo: 'admin',
            ativo: true,
            senha: password // Em produção, seria hasheada
          }]);

        if (userError) {
          console.error('Erro ao criar usuário na tabela:', userError);
        }

        toast.success('Usuário admin criado e autenticado!');
      } else {
        toast.success('Autenticado com sucesso!');
      }

      setIsAuthenticated(true);
      setIsAdmin(true);
      return true;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      toast.error('Erro ao autenticar');
      return false;
    }
  };

  return {
    isAuthenticated,
    isAdmin,
    loading,
    signInAsAdmin
  };
};
