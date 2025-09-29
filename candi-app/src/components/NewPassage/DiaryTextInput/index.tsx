import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { AppTheme } from '../../../theme';

interface DiaryTextInputProps extends TextInputProps {
  variant?: 'title' | 'body';
}

const DiaryTextInput: React.FC<DiaryTextInputProps> = ({ variant = 'body', ...props }) => {
  const inputStyle = variant === 'title' ? styles.titleInput : styles.bodyInput;

  return (
    <TextInput
      style={[styles.baseInput, inputStyle]}
      placeholderTextColor={AppTheme.colors.placeholderText}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  baseInput: {
    color: AppTheme.colors.textColor,
    paddingHorizontal: 16,
  },
  titleInput: {
    ...AppTheme.fonts.titleMedium,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.placeholderBackground,
    marginBottom: 16,
  },
  bodyInput: {
    ...AppTheme.fonts.bodyLarge,
    flex: 1,
    textAlignVertical: 'top', 
  },
});

export default DiaryTextInput;