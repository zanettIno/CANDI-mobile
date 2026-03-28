/**
 * Standardized Button Component
 *
 * This is the single source of truth for all buttons in CANDI.
 * Replaces duplicated button files with a single, configurable component.
 *
 * Usage:
 * <Button variant="primary" onPress={handlePress} title="Salvar" />
 * <Button variant="secondary" onPress={handlePress} title="Cancelar" />
 * <Button variant="outline" onPress={handlePress} title="Mais Informações" />
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { spacing, colors, borderRadius, buttonStyles, typography } from '../../theme/tokens';

interface ButtonProps {
  /** Button display text */
  title: string;

  /** Callback when button is pressed */
  onPress: () => void;

  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'outline';

  /** Disable the button */
  disabled?: boolean;

  /** Show loading state */
  loading?: boolean;

  /** Custom styles to override defaults */
  style?: ViewStyle;

  /** Loading text label (defaults to "Carregando...") */
  loadingLabel?: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'outline';
  $disabled: boolean;
}

const StyledButton = styled(TouchableOpacity)<StyledButtonProps>`
  background-color: ${props => {
    if (props.$disabled) {
      return colors.states.disabled;
    }

    switch (props.$variant) {
      case 'primary':
        return colors.primary.rosa_full;
      case 'secondary':
        return colors.secondary.mint;
      case 'outline':
        return colors.neutral.white;
      default:
        return colors.primary.rosa_full;
    }
  }};

  border-radius: ${borderRadius.full}px;
  padding-horizontal: ${spacing.lg}px;
  padding-vertical: ${spacing.base}px;
  min-height: ${buttonStyles.primary.height}px;

  align-items: center;
  justify-content: center;

  ${props => props.$variant === 'outline' ? `
    border-width: 2px;
    border-color: ${colors.secondary.blue};
  ` : ''}

  opacity: ${props => props.$disabled ? 0.6 : 1};
`;

interface ButtonTextProps {
  $variant: 'primary' | 'secondary' | 'outline';
  $disabled: boolean;
}

const ButtonText = styled(Text)<ButtonTextProps>`
  color: ${props => {
    if (props.$disabled) {
      return colors.text.secondary;
    }

    switch (props.$variant) {
      case 'primary':
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.secondary.blue;
      default:
        return colors.text.primary;
    }
  }};

  font-size: ${typography.sizes.label_large}px;
  font-weight: ${typography.weights.medium};
  font-family: ${typography.fonts.body_medium};
  text-align: center;
`;

const LoadingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
`;

interface LoadingTextProps {
  $variant: 'primary' | 'secondary' | 'outline';
}

const LoadingText = styled(Text)<LoadingTextProps>`
  color: ${props => {
    switch (props.$variant) {
      case 'primary':
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.secondary.blue;
      default:
        return colors.text.primary;
    }
  }};

  font-size: ${typography.sizes.label_large}px;
  font-weight: ${typography.weights.medium};
  font-family: ${typography.fonts.body_medium};
`;

// ============================================================================
// COMPONENT
// ============================================================================

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  loadingLabel = 'Carregando...',
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getLoadingColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.secondary.blue;
      default:
        return colors.text.primary;
    }
  };

  return (
    <StyledButton
      onPress={handlePress}
      disabled={disabled || loading}
      $variant={variant}
      $disabled={disabled || loading}
      style={style}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={disabled ? 'Botão desabilitado' : undefined}
    >
      {loading ? (
        <LoadingContainer>
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
          />
          <LoadingText $variant={variant}>{loadingLabel}</LoadingText>
        </LoadingContainer>
      ) : (
        <ButtonText $variant={variant} $disabled={disabled}>
          {title}
        </ButtonText>
      )}
    </StyledButton>
  );
};

export default Button;
