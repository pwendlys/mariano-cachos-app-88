
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  metadata?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, lida: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.lida).length;
  };

  // Buscar notificações apenas quando o usuário estiver disponível
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]); // Dependência específica e estável

  // Setup real-time listener apenas uma vez
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // Dependência específica e estável

  return {
    notifications,
    loading,
    markAsRead,
    getUnreadCount,
    refetch: fetchNotifications
  };
};
