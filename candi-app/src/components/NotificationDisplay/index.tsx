import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import { useNotification } from '@/context/NotificationContext';

const NotificationDisplay = () => {
  const { notifications, dismissNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return { bg: '#d1fae5', border: '#10b981', icon: 'check-circle', iconColor: '#10b981' };
      case 'error':
        return { bg: '#fee2e2', border: '#ef4444', icon: 'error', iconColor: '#ef4444' };
      case 'warning':
        return { bg: '#fef3c7', border: '#f59e0b', icon: 'warning', iconColor: '#f59e0b' };
      default:
        return { bg: '#dbeafe', border: '#3b82f6', icon: 'info', iconColor: '#3b82f6' };
    }
  };

  return (
    <View style={s.container}>
      {notifications.map((notif) => {
        const colors = getColors(notif.type);
        return (
          <View key={notif.id} style={[s.notification, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <MaterialIcons name={colors.icon as any} size={20} color={colors.iconColor} />
            <View style={{ flex: 1 }}>
              {notif.title && <Text style={s.title}>{notif.title}</Text>}
              <Text style={s.message}>{notif.message}</Text>
            </View>
            <TouchableOpacity onPress={() => dismissNotification(notif.id)}>
              <MaterialIcons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    zIndex: 999,
    gap: 8,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#4b5563',
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
});

export default NotificationDisplay;
