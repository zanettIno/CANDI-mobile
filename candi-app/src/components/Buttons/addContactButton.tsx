import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index'; 

interface AddContactButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  variant?: 'primary' | 'secondary' | 'outline';
}

const StyledButton = styled(TouchableOpacity)<{
  disabled?: boolean;
  variant?: string;
}>`
  background-color: ${props => {
    if (props.disabled) return AppTheme.colors.dotsColor;
    switch (props.variant) {
      case 'secondary':
        return AppTheme.colors.background;
      case 'outline':
        return 'transparent';
      default:
        return AppTheme.colors.tertiary;
    }
  }};
  border-radius: 50px;
  padding: 16px 24px;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  width: 100%;                 
  margin-vertical: 16px;        
  margin-horizontal: 0px;
  border: ${props =>
    props.variant === 'outline' ? `2px solid ${AppTheme.colors.tertiary}` : 'none'
  };
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

const ButtonText = styled(Text)<{
  disabled?: boolean;
  variant?: string;
}>`
  color: ${props => {
    if (props.disabled) return AppTheme.colors.placeholderText;
    switch (props.variant) {
      case 'secondary':
        return AppTheme.colors.nameText;
      case 'outline':
        return AppTheme.colors.tertiary;
      default:
        return AppTheme.colors.cardBackground;
    }
  }};
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyLarge.fontWeight};
  text-align: center;
`;

const LoadingContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled(Text)<{ variant?: string }>`
  color: ${props =>
    props.variant === 'outline' || props.variant === 'secondary'
      ? AppTheme.colors.tertiary
      : AppTheme.colors.cardBackground
  };
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyLarge.fontWeight};
  margin-left: 8px;
`;

export const AddContactButton: React.FC<AddContactButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'primary'
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getLoadingColor = () => {
    switch (variant) {
      case 'secondary':
      case 'outline':
        return AppTheme.colors.tertiary;
      default:
        return AppTheme.colors.cardBackground;
    }
  };

  return (
    <StyledButton
      onPress={handlePress}
      disabled={disabled || loading}
      variant={variant}
      style={style}
      activeOpacity={0.8}
    >
      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="small" color={getLoadingColor()} />
          <LoadingText variant={variant}>Carregando...</LoadingText>
        </LoadingContainer>
      ) : (
        <ButtonText disabled={disabled} variant={variant}>
          Adicionar contato
        </ButtonText>
      )}
    </StyledButton>
  );
};
