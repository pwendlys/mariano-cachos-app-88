
import { useState, useEffect, useCallback } from 'react';
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

  const fetchNotifications = useCallback(async () => {
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
  }, [user?.id]);

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

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const unreadNotifications = notifications.filter(notif => !notif.lida);
      
      if (unreadNotifications.length === 0) return;

      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', user.id)
        .eq('lida', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, lida: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const unreadCount = notifications.filter(notif => !notif.lida).length;

  // Fetch notifications when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user?.id, fetchNotifications]);

  // Setup real-time listener
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
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
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
