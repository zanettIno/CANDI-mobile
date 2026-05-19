import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import { reportPost } from '@/services/inviteService';
import { useToast } from '@/context/NotificationContext';

const REASONS = [
  { value: 'inappropriate', label: 'Conteúdo inapropriado' },
  { value: 'spam', label: 'Spam ou conteúdo repetitivo' },
  { value: 'hate', label: 'Discurso de ódio ou agressividade' },
  { value: 'misinformation', label: 'Desinformação médica' },
  { value: 'other', label: 'Outro' },
];

interface ReportModalProps {
  visible: boolean;
  postId: string;
  onDismiss: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ visible, postId, onDismiss }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleReport = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await reportPost(postId, selected);
      toast.success('Denúncia enviada. Agradecemos por manter a comunidade segura!', 'Denúncia registrada');
      setSelected(null);
      onDismiss();
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível enviar a denúncia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss} statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>Denunciar publicação</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={22} color={AppTheme.colors.placeholderText} />
            </TouchableOpacity>
          </View>
          <Text style={s.subtitle}>Por que você está denunciando esta publicação?</Text>

          {REASONS.map(r => (
            <TouchableOpacity
              key={r.value}
              style={[s.option, selected === r.value && s.optionSelected]}
              onPress={() => setSelected(r.value)}
              activeOpacity={0.7}
            >
              <View style={[s.radio, selected === r.value && s.radioSelected]}>
                {selected === r.value && <View style={s.radioDot} />}
              </View>
              <Text style={[s.optionText, selected === r.value && s.optionTextSelected]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[s.submitBtn, (!selected || loading) && s.submitBtnDisabled]}
            onPress={handleReport}
            disabled={!selected || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.submitText}>Enviar denúncia</Text>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: AppTheme.colors.dotsColor,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.dotsColor,
  },
  title: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: 16, fontWeight: '700', color: AppTheme.colors.nameText,
  },
  subtitle: {
    fontSize: 13, color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    marginVertical: 12,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 6,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1.5, borderColor: AppTheme.colors.dotsColor,
  },
  optionSelected: {
    borderColor: AppTheme.colors.tertiary,
    backgroundColor: AppTheme.colors.secondary + '40',
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: AppTheme.colors.dotsColor,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: AppTheme.colors.tertiary },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: AppTheme.colors.tertiary,
  },
  optionText: {
    fontSize: 14, color: AppTheme.colors.textColor,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily, flex: 1,
  },
  optionTextSelected: { color: AppTheme.colors.tertiary, fontWeight: '600' },
  submitBtn: {
    marginTop: 12, backgroundColor: '#ef4444',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: AppTheme.colors.dotsColor },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: AppTheme.fonts.labelLarge.fontFamily },
});

export default ReportModal;
