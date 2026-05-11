import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { AppTheme } from '@/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  borderRadius?: number;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
  '#FFC4C4', '#CFFFE5', '#759AAB', '#FFD6A5', '#C9B1FF', '#B5EAD7',
];

const getColorForName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const Avatar: React.FC<AvatarProps> = ({ uri, name = '', size = 44, borderRadius }) => {
  const [imgError, setImgError] = useState(false);
  const radius = borderRadius ?? size / 2;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    backgroundColor: getColorForName(name),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  };

  if (uri && !imgError) {
    if (Platform.OS === 'web') {
      return (
        <img
          src={uri}
          style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block' }}
          onError={() => setImgError(true)}
          crossOrigin="anonymous"
        />
      );
    }
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initials: {
    color: AppTheme.colors.cardBackground,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontWeight: '600',
  },
});

export default Avatar;
