import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';

interface GroupAddProps {
  visible: boolean;
  onDismiss: () => void;
  onCreateGroup: (data: { name: string; description: string; topic: string }) => Promise<void>;
}

const GroupAddModal: React.FC<GroupAddProps> = ({ visible, onDismiss, onCreateGroup }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const canCreate = name.trim().length >= 3;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      await onCreateGroup({ name: name.trim(), description: description.trim(), topic: 'GERAL' });
      setName('');
      setDescription('');
      onDismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Criar Grupo</Text>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Nome do grupo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Grupo de Apoio – Quimioterapia"
            placeholderTextColor={AppTheme.colors.placeholderText}
            value={name}
            onChangeText={setName}
            maxLength={80}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o propósito do grupo..."
            placeholderTextColor={AppTheme.colors.placeholderText}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!canCreate || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={AppTheme.colors.cardBackground} />
            ) : (
              <Text style={styles.createBtnText}>Criar Grupo</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: AppTheme.colors.dotsColor,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    color: AppTheme.colors.textColor,
  },
  label: {
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
    fontSize: AppTheme.fonts.labelMedium.fontSize,
    color: AppTheme.colors.placeholderText,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.textColor,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
  },
  textArea: { minHeight: 80 },
  createBtn: {
    marginTop: 24,
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  createBtnDisabled: { backgroundColor: AppTheme.colors.dotsColor },
  createBtnText: {
    color: AppTheme.colors.cardBackground,
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default GroupAddModal;
