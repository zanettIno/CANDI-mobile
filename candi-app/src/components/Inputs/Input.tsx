/**
 * Standardized Input Component
 *
 * This is the single source of truth for text inputs in CANDI.
 * Replaces duplicated input files with a single, configurable component.
 *
 * Features:
 * - Accessible: 16px minimum font size, clear focus states
 * - Consistent spacing and styling
 * - Built-in validation support
 * - Icon support (optional)
 *
 * Usage:
 * <Input
 *   label="Nome"
 *   value={name}
 *   onChangeText={setName}
 *   icon="person"
 *   keyboardType="default"
 * />
 */

import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, TextInputProps, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, colors, borderRadius, typography, inputStyles } from '../../theme/tokens';

interface InputProps extends TextInputProps {
  /** Input label/placeholder text */
  label?: string;

  /** Current input value */
  value: string;

  /** Callback when text changes */
  onChangeText: (text: string) => void;

  /** Icon name from MaterialIcons */
  icon?: string;

  /** Custom icon color */
  iconColor?: string;

  /** Validation function to determine if input is valid */
  isValid?: boolean | undefined;

  /** Error message to display */
  errorMessage?: string;

  /** Custom styles */
  style?: any;

  /** Whether input is focused */
  isFocused?: boolean;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

interface StyledInputProps {
  $isValid?: boolean | undefined;
  $isFocused?: boolean;
}

const Container = styled(View)`
  margin-bottom: ${spacing.base}px;
  margin-horizontal: ${spacing.base}px;
`;

const StyledTextInput = styled(TextInput)<StyledInputProps>`
  background-color: ${props => colors.neutral.form_field};
  border-radius: ${borderRadius.full}px;
  padding-left: ${spacing.base}px;
  padding-right: ${spacing.lg}px;
  padding-vertical: ${spacing.base}px;

  font-size: ${typography.sizes.body_large}px;
  font-family: ${typography.fonts.body};
  font-weight: ${typography.weights.regular};
  color: ${colors.text.primary};

  height: ${inputStyles.default.height}px;

  border-width: 1px;
  border-color: ${props => {
    if (props.$isValid === false) {
      return colors.states.error;
    }
    return props.$isFocused ? colors.primary.rosa_full : colors.neutral.gray;
  }};
`;

interface IconContainerProps {
  $isFocused?: boolean;
}

const IconContainer = styled(TouchableOpacity)<IconContainerProps>`
  position: absolute;
  right: ${spacing.base}px;
  top: 50%;
  transform: translateY(-12px);
`;

const ErrorText = styled.Text`
  color: ${colors.states.error};
  font-size: ${typography.sizes.label_medium}px;
  font-family: ${typography.fonts.body};
  margin-top: ${spacing.xs}px;
  margin-left: ${spacing.base}px;
`;

// ============================================================================
// COMPONENT
// ============================================================================

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label = 'Input',
      value,
      onChangeText,
      icon,
      iconColor = colors.secondary.blue,
      isValid,
      errorMessage,
      style,
      isFocused: externalFocused,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const finalIsFocused = externalFocused !== undefined ? externalFocused : isFocused;

    return (
      <Container style={style}>
        <View style={{ position: 'relative' }}>
          <StyledTextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={label}
            placeholderTextColor={colors.text.placeholder}
            $isValid={isValid}
            $isFocused={finalIsFocused}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={label}
            accessibilityRole="search"
            {...props}
          />

          {icon && (
            <IconContainer $isFocused={finalIsFocused}>
              <MaterialIcons
                name={icon as any}
                size={24}
                color={finalIsFocused ? colors.primary.rosa_full : iconColor}
              />
            </IconContainer>
          )}
        </View>

        {isValid === false && errorMessage && (
          <ErrorText>{errorMessage}</ErrorText>
        )}
      </Container>
    );
  }
);

Input.displayName = 'Input';

export default Input;
