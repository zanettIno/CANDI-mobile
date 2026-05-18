import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Pressable, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';

export interface ActionSheetOption {
  label: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onDismiss: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible, title, options, onDismiss,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onDismiss}
    statusBarTranslucent
  >
    <Pressable style={s.overlay} onPress={onDismiss}>
      <View style={s.sheet}>
        <View style={s.handle} />
        {title && <Text style={s.title}>{title}</Text>}
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[s.option, i < options.length - 1 && s.optionBorder]}
              onPress={() => {
                onDismiss();
                // Aguarda o Modal fechar antes de executar a ação (evita conflito de modais)
                setTimeout(() => opt.onPress(), 200);
              }}
              activeOpacity={0.7}
            >
              {opt.icon && (
                <MaterialIcons
                  name={opt.icon}
                  size={20}
                  color={opt.destructive ? '#ef4444' : AppTheme.colors.textColor}
                  style={s.icon}
                />
              )}
              <Text style={[s.label, opt.destructive && s.labelDestructive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={s.cancelBtn} onPress={onDismiss} activeOpacity={0.7}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  </Modal>
);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: AppTheme.colors.dotsColor,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  title: {
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
    fontSize: 13,
    color: AppTheme.colors.placeholderText,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
  },
  icon: { marginRight: 14 },
  label: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: 15,
    fontWeight: '500',
    color: AppTheme.colors.textColor,
  },
  labelDestructive: { color: '#ef4444' },
  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: AppTheme.colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
  },
  cancelText: {
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.placeholderText,
  },
});

export default ActionSheet;
