import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatContextType {
  totalUnread: number;
  setTotalUnread: (count: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  inboxRefreshKey: number;
  triggerInboxRefresh: () => void;
  feedRefreshKey: number;
  triggerFeedRefresh: () => void;
}

const ChatContext = createContext<ChatContextType>({
  totalUnread: 0,
  setTotalUnread: () => {},
  incrementUnread: () => {},
  clearUnread: () => {},
  activeConversationId: null,
  setActiveConversationId: () => {},
  inboxRefreshKey: 0,
  triggerInboxRefresh: () => {},
  feedRefreshKey: 0,
  triggerFeedRefresh: () => {},
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalUnread, setTotalUnreadState] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inboxRefreshKey, setInboxRefreshKey] = useState(0);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  const setTotalUnread = useCallback((count: number) => {
    setTotalUnreadState(Math.max(0, count));
  }, []);

  const incrementUnread = useCallback(() => {
    setTotalUnreadState(prev => prev + 1);
  }, []);

  const clearUnread = useCallback(() => {
    setTotalUnreadState(0);
  }, []);

  const triggerInboxRefresh = useCallback(() => {
    setInboxRefreshKey(k => k + 1);
  }, []);

  const triggerFeedRefresh = useCallback(() => {
    setFeedRefreshKey(k => k + 1);
  }, []);

  return (
    <ChatContext.Provider value={{
      totalUnread, setTotalUnread, incrementUnread, clearUnread,
      activeConversationId, setActiveConversationId,
      inboxRefreshKey, triggerInboxRefresh,
      feedRefreshKey, triggerFeedRefresh,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
