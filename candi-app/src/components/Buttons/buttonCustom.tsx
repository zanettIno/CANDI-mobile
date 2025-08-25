import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

interface ButtonCustomProps {
  title: string;
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
    if (props.disabled) return '#cccccc';
    switch (props.variant) {
      case 'secondary':
        return '#f0f0f0';
      case 'outline':
        return 'transparent';
      default:
        return '#759AAB'; 
    }
  }};
  border-radius: 50px;
  padding: 16px 24px;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  margin-vertical: 8px;
  border: ${props => 
    props.variant === 'outline' ? '2px solid #759AAB' : 'none'
  };
  opacity: ${props => props.disabled ? 0.6 : 1};
  margin: 16px;
`;

const ButtonText = styled(Text)<{ 
  disabled?: boolean; 
  variant?: string;
}>`
  color: ${props => {
    if (props.disabled) return '#999999';
    switch (props.variant) {
      case 'secondary':
        return '#333333';
      case 'outline':
        return '#759AAB';
      default:
        return '#ffffff';
    }
  }};
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const LoadingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled(Text)<{ variant?: string }>`
  color: ${props => 
    props.variant === 'outline' || props.variant === 'secondary' 
      ? '#759AAB' 
      : '#ffffff'
  };
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
`;

const ButtonCustom: React.FC<ButtonCustomProps> = ({
  title,
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
        return '#759AAB';
      default:
        return '#ffffff';
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
          <ActivityIndicator 
            size="small" 
            color={getLoadingColor()} 
          />
          <LoadingText variant={variant}>Carregando...</LoadingText>
        </LoadingContainer>
      ) : (
        <ButtonText disabled={disabled} variant={variant}>
          {title}
        </ButtonText>
      )}
    </StyledButton>
  );
};

export default ButtonCustom;

