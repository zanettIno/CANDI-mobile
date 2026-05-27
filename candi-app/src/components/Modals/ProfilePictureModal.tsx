import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Image, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../theme';
import { API_BASE_URL } from '../../constants/api';
import { useToast } from '@/context/NotificationContext';

const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  user: { profile_id: string; profile_picture_last_updated?: number };
  onPictureUpdate: (isDeletion: boolean) => void;
}

const ProfilePictureModal: React.FC<Props> = ({ visible, onDismiss, user, onPictureUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const avatarUri = user.profile_picture_last_updated
    ? `${S3_BASE}/${user.profile_id}.jpg?t=${user.profile_picture_last_updated}`
    : undefined;

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permissão necessária', 'Permita o acesso à galeria.'); return; }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.9,
    });
    if (res.canceled || !res.assets?.[0]) return;

    const img = res.assets[0];
    const fd = new FormData();
    if (Platform.OS === 'web') {
      const blob = await (await fetch(img.uri)).blob();
      fd.append('file', blob, 'profile.jpg');
    } else {
      fd.append('file', { uri: img.uri, name: 'profile.jpg', type: 'image/jpeg' } as any);
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const r = await fetch(`${API_BASE_URL}/profile-image/upload`, {
        method: 'POST', body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error((await r.json()).message || 'Erro ao enviar');
      onPictureUpdate(false);
      toast.success('Foto de perfil atualizada!');
      onDismiss();
    } catch (e: any) {
      toast.error(e.message || 'Não foi possível atualizar a foto.');
    } finally { setUploading(false); }
  };

  const removePicture = () => {
    Alert.alert('Remover foto', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          setUploading(true);
          try {
            const token = await AsyncStorage.getItem('accessToken');
            await fetch(`${API_BASE_URL}/profile-image`, {
              method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
            });
            onPictureUpdate(true);
            toast.success('Foto de perfil removida.');
            onDismiss();
          } catch { toast.error('Não foi possível remover a foto.'); }
          finally { setUploading(false); }
        }
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss} statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />

          <View style={s.header}>
            <Text style={s.title}>Foto de Perfil</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={s.avatarCenter}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={s.avatar} />
            ) : (
              <View style={s.avatarFallback}>
                <MaterialIcons name="person" size={48} color={AppTheme.colors.tertiary} />
              </View>
            )}
          </View>

          <Text style={s.hint}>Sua foto fica visível para outros membros da comunidade.</Text>

          {uploading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator color={AppTheme.colors.tertiary} size="large" />
              <Text style={s.loadingText}>Enviando...</Text>
            </View>
          ) : (
            <View style={s.actions}>
              <TouchableOpacity style={s.primaryBtn} onPress={pickAndUpload} activeOpacity={0.85}>
                <MaterialIcons name="add-a-photo" size={18} color="#fff" />
                <Text style={s.primaryBtnText}>
                  {avatarUri ? 'Alterar foto' : 'Adicionar foto'}
                </Text>
              </TouchableOpacity>
              {avatarUri && (
                <TouchableOpacity style={s.removeBtn} onPress={removePicture} activeOpacity={0.85}>
                  <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                  <Text style={s.removeBtnText}>Remover foto</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={{ height: 16 }} />
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: AppTheme.colors.dotsColor,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  title: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: 17, fontWeight: '700', color: AppTheme.colors.nameText,
  },
  avatarCenter: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 110, height: 110, borderRadius: 22, borderWidth: 3, borderColor: AppTheme.colors.secondary },
  avatarFallback: {
    width: 110, height: 110, borderRadius: 22,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderStyle: 'dashed', borderColor: AppTheme.colors.tertiary,
  },
  hint: {
    textAlign: 'center', fontSize: 13, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, marginBottom: 20, lineHeight: 18,
  },
  loadingWrap: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  loadingText: { color: AppTheme.colors.placeholderText, fontFamily: AppTheme.fonts.bodySmall.fontFamily },
  actions: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14, paddingVertical: 14,
  },
  primaryBtnText: {
    color: '#fff', fontSize: 15, fontWeight: '700',
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
  removeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff5f5',
  },
  removeBtnText: {
    color: '#ef4444', fontSize: 14, fontWeight: '600',
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
});

export default ProfilePictureModal;
