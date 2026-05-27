import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Image, Platform, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '@/theme';
import { uploadGroupImage } from '@/services/communityService';

const TOPICS = ['GERAL', 'SAÚDE', 'APOIO', 'TRATAMENTO', 'NUTRIÇÃO', 'EXERCÍCIO', 'MENTAL'];

interface GroupAddProps {
  visible: boolean;
  onDismiss: () => void;
  onCreateGroup: (data: { name: string; description: string; topic: string }) => Promise<{ group_id: string } | any>;
}

const GroupAddModal: React.FC<GroupAddProps> = ({ visible, onDismiss, onCreateGroup }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('GERAL');
  const [localPhoto, setLocalPhoto] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [localBanner, setLocalBanner] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const canCreate = name.trim().length >= 3;

  const pickImage = async (type: 'photo' | 'banner') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permissão necessária', 'Permita o acesso à galeria.'); return; }
    const aspect: [number, number] = type === 'banner' ? [3, 1] : [1, 1];
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect, quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      const file = { uri: a.uri, name: `group-${type}.jpg`, type: a.mimeType || 'image/jpeg' };
      if (type === 'photo') setLocalPhoto(file);
      else setLocalBanner(file);
    }
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      const created = await onCreateGroup({ name: name.trim(), description: description.trim(), topic });
      if (created?.group_id) {
        // Faz uploads em paralelo silenciosamente
        await Promise.allSettled([
          localPhoto ? uploadGroupImage(created.group_id, localPhoto, 'photo') : Promise.resolve(),
          localBanner ? uploadGroupImage(created.group_id, localBanner, 'banner') : Promise.resolve(),
        ]);
      }
      setName('');
      setDescription('');
      setTopic('GERAL');
      setLocalPhoto(null);
      setLocalBanner(null);
      onDismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onDismiss} />
      <View style={s.sheet}>
        <View style={s.handle} />

        <View style={s.header}>
          <Text style={s.title}>Criar Grupo</Text>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

          {/* Banner do grupo */}
          <Text style={s.label}>Banner do grupo</Text>
          <TouchableOpacity style={s.bannerPicker} onPress={() => pickImage('banner')} activeOpacity={0.8}>
            {localBanner ? (
              <Image source={{ uri: localBanner.uri }} style={s.bannerPreview} />
            ) : (
              <View style={s.bannerPlaceholder}>
                <MaterialIcons name="panorama" size={28} color={AppTheme.colors.placeholderText} />
                <Text style={s.photoHint}>Toque para adicionar banner (3:1)</Text>
              </View>
            )}
            <View style={s.bannerEditTag}>
              <MaterialIcons name="camera-alt" size={13} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Foto do grupo */}
          <Text style={s.label}>Foto do grupo</Text>
          <View style={s.photoRow}>
            <TouchableOpacity style={s.photoPicker} onPress={() => pickImage('photo')} activeOpacity={0.8}>
              {localPhoto ? (
                <Image source={{ uri: localPhoto.uri }} style={s.photoPreview} />
              ) : (
                <View style={s.photoPlaceholder}>
                  <MaterialIcons name="add-a-photo" size={28} color={AppTheme.colors.tertiary} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={s.photoHint}>
              {localPhoto ? 'Toque para trocar' : 'Toque para adicionar\nfoto ao grupo'}
            </Text>
          </View>

          <Text style={s.label}>Nome do grupo *</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: Grupo de Apoio – Quimioterapia"
            placeholderTextColor={AppTheme.colors.placeholderText}
            value={name}
            onChangeText={setName}
            maxLength={80}
          />

          <Text style={s.label}>Descrição</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Descreva o propósito do grupo..."
            placeholderTextColor={AppTheme.colors.placeholderText}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />

          <Text style={s.label}>Tópico</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.topicScroll}>
            {TOPICS.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.topicChip, topic === t && s.topicChipActive]}
                onPress={() => setTopic(t)}
                activeOpacity={0.7}
              >
                <Text style={[s.topicText, topic === t && s.topicTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[s.createBtn, !canCreate && s.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!canCreate || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={AppTheme.colors.cardBackground} />
            ) : (
              <Text style={s.createBtnText}>Criar Grupo</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: AppTheme.colors.dotsColor,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  title: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    color: AppTheme.colors.textColor,
  },
  label: {
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
    fontSize: 12, color: AppTheme.colors.placeholderText,
    textTransform: 'uppercase', letterSpacing: 0.4,
    marginBottom: 8, marginTop: 16,
  },
  bannerPicker: { borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 4 },
  bannerPreview: { width: '100%', height: 90, borderRadius: 12 },
  bannerPlaceholder: {
    width: '100%', height: 90, borderRadius: 12,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1, borderStyle: 'dashed', borderColor: AppTheme.colors.dotsColor,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  bannerEditTag: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: AppTheme.colors.tertiary,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photoPicker: { borderRadius: 16, overflow: 'hidden', width: 72, height: 72 },
  photoPreview: { width: 72, height: 72, borderRadius: 16 },
  photoPlaceholder: {
    width: 72, height: 72, borderRadius: 16,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: AppTheme.colors.tertiary, borderStyle: 'dashed',
  },
  photoHint: {
    fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily, lineHeight: 16,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.textColor,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  topicScroll: { marginBottom: 4 },
  topicChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  topicChipActive: { backgroundColor: AppTheme.colors.secondary, borderColor: AppTheme.colors.tertiary },
  topicText: {
    fontSize: 12, fontWeight: '600', color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  topicTextActive: { color: AppTheme.colors.tertiary },
  createBtn: {
    marginTop: 20, backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  createBtnDisabled: { backgroundColor: AppTheme.colors.dotsColor },
  createBtnText: {
    color: AppTheme.colors.cardBackground,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: 15, fontWeight: '700',
  },
});

export default GroupAddModal;
