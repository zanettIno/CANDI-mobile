import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, Image, Platform, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '../../theme/index';
import { createPostWithImage } from '@/services/communityService';
import Avatar from '@/components/Avatar';
import { useProfile } from '@/context/ProfileContext';

const MAX_CHARS = 500;
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

interface PostCardProps {
  onPostSuccess: (post: any) => void;
  subgroup?: string;
}

// Renderiza o texto com hashtags destacadas
const HighlightedPreview: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(#[a-zA-ZÀ-ú0-9_]+)/g);
  return (
    <Text style={styles.preview}>
      {parts.map((part, i) =>
        part.startsWith('#')
          ? <Text key={i} style={styles.hashtag}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
};

export const PostCard: React.FC<PostCardProps> = ({ onPostSuccess, subgroup }) => {
  const { avatarUri, profileName } = useProfile();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string; name: string; type: string;
  } | null>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isDisabled = isLoading || content.trim().length === 0 || isOverLimit;

  const hashtags = [...new Set((content.match(/#([a-zA-ZÀ-ú0-9_]+)/g) || []))];

  const handlePickImage = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName || `post_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    }
  }, []);

  const handlePublish = async () => {
    if (!content.trim()) { Alert.alert('Atenção', 'A postagem não pode ser vazia.'); return; }
    if (isOverLimit) { Alert.alert('Atenção', `Limite de ${MAX_CHARS} caracteres excedido.`); return; }
    setIsLoading(true);
    try {
      const { post } = await createPostWithImage(content.trim(), 'GERAL', selectedImage || undefined, subgroup);
      setContent('');
      setSelectedImage(null);
      setExpanded(false);
      onPostSuccess(post);
    } catch (err: any) {
      Alert.alert('Erro ao publicar', err.message || 'Não foi possível completar a publicação.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!expanded) {
    return (
      <TouchableOpacity style={styles.collapsed} onPress={() => setExpanded(true)} activeOpacity={0.8}>
        <Avatar uri={avatarUri || undefined} name={profileName} size={34} />
        <Text style={styles.collapsedPlaceholder}>O que você quer compartilhar?</Text>
        <TouchableOpacity onPress={() => setExpanded(true)} style={styles.collapsedImg} hitSlop={HIT_SLOP} activeOpacity={0.7}>
          <MaterialIcons name="photo-camera" size={22} color={AppTheme.colors.placeholderText} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar uri={avatarUri || undefined} name={profileName} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{profileName}</Text>
          {hashtags.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tagsRow}>
                {hashtags.map(t => (
                  <View key={t} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
        <TouchableOpacity onPress={() => { setExpanded(false); setContent(''); setSelectedImage(null); }} hitSlop={HIT_SLOP} activeOpacity={0.7}>
          <MaterialIcons name="close" size={20} color={AppTheme.colors.placeholderText} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={'Escreva sua mensagem...\n\nUse #hashtag para categorizar'}
        placeholderTextColor={AppTheme.colors.placeholderText}
        multiline
        value={content}
        onChangeText={setContent}
        editable={!isLoading}
        maxLength={MAX_CHARS + 20}
        textAlignVertical="top"
        autoFocus
      />

      {selectedImage && (
        <View style={styles.imagePreviewWrapper}>
          <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} resizeMode="cover" />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)} hitSlop={HIT_SLOP}>
            <MaterialIcons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handlePickImage} disabled={isLoading} hitSlop={HIT_SLOP} activeOpacity={0.7}>
          <MaterialIcons
            name={selectedImage ? 'photo' : 'photo-camera'}
            size={22}
            color={selectedImage ? AppTheme.colors.tertiary : AppTheme.colors.placeholderText}
          />
        </TouchableOpacity>

        <View style={styles.actionsRight}>
          {charCount > 0 && (
            <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
              {charCount}/{MAX_CHARS}
            </Text>
          )}
          <TouchableOpacity
            onPress={handlePublish}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={[styles.publishBtn, isDisabled && styles.publishBtnDisabled]}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.publishBtnText}>Publicar</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  collapsed: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 14, padding: 12, margin: 12, marginBottom: 4,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
  },
  collapsedPlaceholder: {
    flex: 1, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
  },
  collapsedImg: { padding: 4 },

  card: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16, padding: 16, margin: 12, marginBottom: 4,
    borderWidth: 1, borderColor: AppTheme.colors.dotsColor,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  authorName: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: '600', color: AppTheme.colors.nameText,
  },
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tagBadge: {
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
  },
  tagText: {
    fontSize: 11, fontWeight: '600', color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },

  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12, padding: 12, minHeight: 110,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.textColor, lineHeight: 22,
  },
  preview: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.textColor, lineHeight: 22,
  },
  hashtag: { color: AppTheme.colors.tertiary, fontWeight: '700' },

  imagePreviewWrapper: { marginTop: 10, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: 160, borderRadius: 10 },
  removeImageBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 10,
  },
  actionsRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  charCount: {
    fontSize: 12, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
  },
  charCountOver: { color: '#d9534f', fontWeight: '600' },
  publishBtn: {
    backgroundColor: AppTheme.colors.tertiary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    minWidth: 80, alignItems: 'center', minHeight: 36, justifyContent: 'center',
  },
  publishBtnDisabled: { backgroundColor: AppTheme.colors.dotsColor },
  publishBtnText: {
    color: '#fff', fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: 13, fontWeight: '600',
  },
});

export default PostCard;
