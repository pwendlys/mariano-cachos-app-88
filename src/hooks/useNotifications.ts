
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  tipo: 'agendamento_aprovado' | 'compra_concluida';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
  metadata: any;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      console.log('🔔 [useNotifications] Fetching notifications for user:', user.id);
      
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [useNotifications] Error fetching notifications:', error);
        throw error;
      }

      console.log('✅ [useNotifications] Notifications fetched:', data);
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.lida).length);
    } catch (error: any) {
      console.error('❌ [useNotifications] Error in fetchNotifications:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: error.message || "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('📖 [useNotifications] Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ [useNotifications] Error marking notification as read:', error);
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, lida: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log('✅ [useNotifications] Notification marked as read');
    } catch (error: any) {
      console.error('❌ [useNotifications] Error in markAsRead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      console.log('📖 [useNotifications] Marking all notifications as read');
      
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', user.id)
        .eq('lida', false);

      if (error) {
        console.error('❌ [useNotifications] Error marking all notifications as read:', error);
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, lida: true }))
      );
      setUnreadCount(0);
      
      console.log('✅ [useNotifications] All notifications marked as read');
    } catch (error: any) {
      console.error('❌ [useNotifications] Error in markAllAsRead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    console.log('🚀 [useNotifications] Setting up notifications for user:', user.id);
    
    // Fetch initial notifications
    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 [useNotifications] New notification received:', payload);
          const newNotification = payload.new as Notification;
          
          // Add to local state
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.titulo,
            description: newNotification.mensagem,
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 [useNotifications] Subscription status:', status);
      });

    return () => {
      console.log('🧹 [useNotifications] Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
};
