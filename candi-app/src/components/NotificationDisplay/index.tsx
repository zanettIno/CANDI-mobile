import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Platform, StatusBar, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme } from '@/theme';
import { useNotification, Notification } from '@/context/NotificationContext';

const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 6 : 54;
// Web não suporta useNativeDriver: true
const USE_NATIVE = Platform.OS !== 'web';

const NotifBanner: React.FC<{ notif: Notification; onDismiss: () => void }> = ({ notif, onDismiss }) => {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const dismissedRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: USE_NATIVE }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: USE_NATIVE }),
    ]).start();
  }, []);

  const close = (afterClose?: () => void) => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: USE_NATIVE }),
      Animated.timing(translateY, { toValue: -20, duration: 180, useNativeDriver: USE_NATIVE }),
    ]).start((result) => {
      onDismiss();
      if (typeof afterClose === 'function') afterClose();
    });
  };

  const goToConversation = () => {
    if (!notif.conversationId) { close(); return; }
    const convId = notif.conversationId;
    const convName = notif.conversationName || notif.title;
    close(() => {
      router.push({
        pathname: '/screens/community/chatCommunity',
        params: { conversationId: convId, userName: convName },
      });
    });
  };

  const handleMarkRead = () => {
    notif.onMarkRead?.();
    close();
  };

  const isChat = !!notif.conversationId;
  const accent = notif.type === 'success' ? '#10b981'
    : notif.type === 'error' ? '#ef4444'
    : notif.type === 'warning' ? '#f59e0b'
    : AppTheme.colors.tertiary;

  return (
    <Animated.View style={[s.wrap, { opacity, transform: [{ translateY }] }]}>
      {/* Toque no conteúdo → vai pra conversa */}
      <TouchableOpacity style={s.main} onPress={isChat ? goToConversation : () => close()} activeOpacity={0.85}>
        <View style={[s.iconCircle, { backgroundColor: accent + '22' }]}>
          <MaterialIcons
            name={isChat ? 'chat-bubble' : notif.type === 'success' ? 'check-circle' : 'notifications'}
            size={20}
            color={accent}
          />
        </View>
        <View style={s.texts}>
          {notif.title ? <Text style={s.title} numberOfLines={1}>{notif.title}</Text> : null}
          <Text style={s.msg} numberOfLines={2}>{notif.message}</Text>
        </View>
        <TouchableOpacity
          onPress={() => close()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={s.closeBtn}
        >
          <MaterialIcons name="close" size={16} color={AppTheme.colors.placeholderText} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Ações — só para chat */}
      {isChat && (
        <View style={s.footer}>
          <TouchableOpacity style={s.action} onPress={handleMarkRead} activeOpacity={0.7}>
            <MaterialIcons name="done-all" size={14} color={AppTheme.colors.tertiary} />
            <Text style={s.actionTxt}>Marcar como lida</Text>
          </TouchableOpacity>
          <View style={s.sep} />
          <TouchableOpacity style={s.action} onPress={goToConversation} activeOpacity={0.7}>
            <MaterialIcons name="arrow-forward" size={14} color={AppTheme.colors.tertiary} />
            <Text style={s.actionTxt}>Abrir</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const NotificationDisplay = () => {
  const { notifications, dismissNotification } = useNotification();
  if (notifications.length === 0) return null;

  // Deduplica: 1 notificação por conversa (mantém a mais recente)
  const seen = new Set<string>();
  const deduped = notifications.filter(n => {
    const key = n.conversationId || n.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 2);

  const content = (
    <View style={s.container} pointerEvents="box-none">
      {deduped.map(n => (
        <NotifBanner key={n.id} notif={n} onDismiss={() => dismissNotification(n.id)} />
      ))}
    </View>
  );

  // Native: Modal transparent sempre fica acima de tudo
  if (Platform.OS !== 'web') {
    return (
      <Modal transparent visible animationType="none" statusBarTranslucent>
        {content}
      </Modal>
    );
  }

  return content;
};

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: TOP,
    left: 10,
    right: 10,
    zIndex: 99999,
    gap: 8,
  },
  wrap: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  texts: { flex: 1 },
  title: {
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.colors.nameText,
    marginBottom: 2,
  },
  msg: {
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    fontSize: 13,
    color: AppTheme.colors.roleText,
    lineHeight: 17,
  },
  closeBtn: { padding: 2, flexShrink: 0 },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.dotsColor,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
  },
  actionTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  sep: { width: 1, backgroundColor: AppTheme.colors.dotsColor, marginVertical: 4 },
});

export default NotificationDisplay;
