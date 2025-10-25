import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme'; 

interface addCheckpointButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

const StyledButton = styled(TouchableOpacity)<{
  disabled?: boolean;
}>`
  background-color: ${props => 
    props.disabled 
      ? AppTheme.colors.dotsColor 
      : AppTheme.colors.tertiary 
  };
  border-radius: 50px;
  padding: 16px 24px;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  margin-vertical: 16px; 
  border: none; 
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const ButtonText = styled(Text)<{
  disabled?: boolean;
}>`
  color: ${props => 
    props.disabled 
      ? AppTheme.colors.placeholderText 
      : AppTheme.colors.cardBackground 
  };
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyLarge.fontWeight};
  text-align: center;
`;

const LoadingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled(Text)`
  color: ${AppTheme.colors.cardBackground};
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyLarge.fontWeight};
  margin-left: 8px;
`;

export const AddMilestoneButton: React.FC<addCheckpointButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  style
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <StyledButton
      onPress={handlePress}
      disabled={disabled || loading}
      style={style}
      activeOpacity={0.8}
    >
      {loading ? (
        <LoadingContainer>
          <ActivityIndicator
            size="small"
            color={AppTheme.colors.cardBackground}
          />
          <LoadingText>Carregando...</LoadingText>
        </LoadingContainer>
      ) : (
        <ButtonText disabled={disabled}>
          Adicionar marco
        </ButtonText>
      )}
    </StyledButton>
  );
};
