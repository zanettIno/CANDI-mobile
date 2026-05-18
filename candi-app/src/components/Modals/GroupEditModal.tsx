import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator, Alert, Image, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '@/theme';

const TOPICS = ['GERAL', 'SAÚDE', 'APOIO', 'TRATAMENTO', 'NUTRIÇÃO', 'EXERCÍCIO', 'MENTAL'];

interface GroupEditModalProps {
  visible: boolean;
  groupId: string;
  initialName: string;
  initialDescription: string;
  initialTopic: string;
  initialPhotoUrl?: string;
  initialBannerUrl?: string;
  onDismiss: () => void;
  onSave: (data: { name?: string; description?: string; topic?: string }) => Promise<void>;
  onUploadImage: (
    file: { uri: string; name: string; type: string },
    type: 'photo' | 'banner',
  ) => Promise<void>;
}

export const GroupEditModal: React.FC<GroupEditModalProps> = ({
  visible, groupId, initialName, initialDescription, initialTopic,
  initialPhotoUrl, initialBannerUrl,
  onDismiss, onSave, onUploadImage,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [topic, setTopic] = useState(initialTopic || 'GERAL');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [localBanner, setLocalBanner] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDescription(initialDescription);
      setTopic(initialTopic || 'GERAL');
      setLocalPhoto(null);
      setLocalBanner(null);
    }
  }, [visible, initialName, initialDescription, initialTopic]);

  const pickImage = async (type: 'photo' | 'banner') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para selecionar imagens.');
      return;
    }

    const ratio: [number, number] = type === 'banner' ? [3, 1] : [1, 1];
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: ratio,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const fileName = `group-${type}-${groupId}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';

    if (type === 'photo') setUploadingPhoto(true);
    else setUploadingBanner(true);

    try {
      await onUploadImage({ uri, name: fileName, type: mimeType }, type);
      if (type === 'photo') setLocalPhoto(uri);
      else setLocalBanner(uri);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível fazer o upload.');
    } finally {
      if (type === 'photo') setUploadingPhoto(false);
      else setUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Erro', 'O nome do grupo não pode estar vazio.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), topic });
      onDismiss();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const photoSrc = localPhoto || initialPhotoUrl;
  const bannerSrc = localBanner || initialBannerUrl;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Editar Grupo</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={24} color={AppTheme.colors.placeholderText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
            {/* Banner */}
            <Text style={s.label}>Banner do grupo</Text>
            <TouchableOpacity style={s.bannerContainer} onPress={() => pickImage('banner')} activeOpacity={0.8}>
              {bannerSrc ? (
                <Image source={{ uri: bannerSrc }} style={s.bannerImage} />
              ) : (
                <View style={[s.bannerImage, s.bannerPlaceholder]}>
                  <MaterialIcons name="image" size={36} color={AppTheme.colors.placeholderText} />
                  <Text style={s.placeholderText}>Toque para adicionar banner</Text>
                </View>
              )}
              {uploadingBanner ? (
                <View style={s.uploadOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : (
                <View style={s.uploadIcon}>
                  <MaterialIcons name="camera-alt" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Foto */}
            <Text style={s.label}>Foto do grupo</Text>
            <View style={s.photoRow}>
              <TouchableOpacity style={s.photoContainer} onPress={() => pickImage('photo')} activeOpacity={0.8}>
                {photoSrc ? (
                  <Image source={{ uri: photoSrc }} style={s.photoImage} />
                ) : (
                  <View style={[s.photoImage, s.photoPlaceholder]}>
                    <MaterialIcons name="groups" size={32} color={AppTheme.colors.tertiary} />
                  </View>
                )}
                {uploadingPhoto ? (
                  <View style={[s.uploadOverlay, { borderRadius: 16 }]}>
                    <ActivityIndicator color="#fff" />
                  </View>
                ) : (
                  <View style={[s.uploadIcon, { bottom: 4, right: 4 }]}>
                    <MaterialIcons name="camera-alt" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={s.photoHint}>Toque para alterar a foto do grupo</Text>
            </View>

            {/* Nome */}
            <Text style={s.label}>Nome do grupo *</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome do grupo"
              placeholderTextColor={AppTheme.colors.placeholderText}
              maxLength={60}
            />

            {/* Descrição */}
            <Text style={s.label}>Descrição</Text>
            <TextInput
              style={[s.input, s.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o propósito do grupo..."
              placeholderTextColor={AppTheme.colors.placeholderText}
              multiline
              numberOfLines={3}
              maxLength={300}
            />

            {/* Tópico */}
            <Text style={s.label}>Tópico</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.topicScroll}>
              {TOPICS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.topicChip, topic === t && s.topicChipActive]}
                  onPress={() => setTopic(t)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.topicChipText, topic === t && s.topicChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[s.saveBtn, saving && s.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={s.saveBtnText}>Salvar alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: AppTheme.colors.dotsColor,
    alignSelf: 'center', marginTop: 10,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  sheetTitle: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    fontWeight: '700', color: AppTheme.colors.nameText,
  },
  body: { padding: 20, gap: 6, paddingBottom: 40 },

  label: {
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
    fontSize: 13, fontWeight: '600',
    color: AppTheme.colors.roleText,
    marginTop: 12, marginBottom: 6,
  },

  bannerContainer: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  bannerImage: { width: '100%', height: 110, borderRadius: 12, backgroundColor: AppTheme.colors.background },
  bannerPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppTheme.colors.dotsColor, borderStyle: 'dashed' },
  placeholderText: {
    fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, marginTop: 4,
  },

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photoContainer: { position: 'relative', borderRadius: 16, overflow: 'hidden', width: 72, height: 72 },
  photoImage: { width: 72, height: 72, borderRadius: 16, backgroundColor: AppTheme.colors.secondary },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppTheme.colors.dotsColor, borderStyle: 'dashed' },
  photoHint: {
    flex: 1, fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },

  uploadOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  uploadIcon: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: AppTheme.colors.tertiary,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },

  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.textColor,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  topicScroll: { marginVertical: 4 },
  topicChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  topicChipActive: { backgroundColor: AppTheme.colors.secondary, borderColor: AppTheme.colors.tertiary },
  topicChipText: {
    fontSize: 12, fontWeight: '600', color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  topicChipTextActive: { color: AppTheme.colors.tertiary },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 14,
    paddingVertical: 14, marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: {
    color: '#fff', fontSize: 15, fontWeight: '700',
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
  },
});

export default GroupEditModal;
