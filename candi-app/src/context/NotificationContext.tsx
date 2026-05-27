import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  // Ações para notificações de chat
  conversationId?: string;
  conversationName?: string;
  onMarkRead?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (n: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  dismissNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((n: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const duration = n.duration ?? 6000;
    setNotifications(prev => {
      // Se já existe notificação da mesma conversa, substitui em vez de acumular
      if (n.conversationId) {
        const filtered = prev.filter(x => x.conversationId !== n.conversationId);
        return [...filtered, { ...n, id }];
      }
      return [...prev, { ...n, id }];
    });
    if (duration > 0) {
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== id)), duration);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  return ctx;
};

// Hook de conveniência para feedback de CRUD
export const useToast = () => {
  const { showNotification } = useNotification();
  return {
    success: (message: string, title?: string) =>
      showNotification({ title, message, type: 'success', duration: 3000 }),
    error: (message: string) =>
      showNotification({ title: 'Erro', message, type: 'error', duration: 4000 }),
    info: (message: string, title?: string) =>
      showNotification({ title, message, type: 'info', duration: 3000 }),
    warning: (message: string, title?: string) =>
      showNotification({ title, message, type: 'warning', duration: 3500 }),
  };
};
