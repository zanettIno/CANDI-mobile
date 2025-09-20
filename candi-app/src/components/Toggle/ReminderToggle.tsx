import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index';

interface ReminderToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  style?: any;
}

const Container = styled(View)`
  margin-bottom: 16px;
`;

const ToggleContainer = styled(View)`
  flex-direction: row;
  border-radius: 50px;
  overflow: hidden;
  background-color: ${AppTheme.colors.background};
`;

const ToggleButton = styled(TouchableOpacity)<{ isActive: boolean }>`
  flex: 1;
  padding: 16px;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  background-color: ${props =>
    props.isActive ? AppTheme.colors.tertiary : 'transparent'
  };
`;

const ToggleText = styled(Text)<{ isActive: boolean }>`
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${props => (props.isActive ? '600' : '400')};
  color: ${props =>
    props.isActive
      ? '#FFFFFF'
      : AppTheme.colors.tertinaryTextColor
  };
`;

export const ReminderToggle: React.FC<ReminderToggleProps> = ({
  value,
  onToggle,
  style
}) => {
  return (
    <Container style={style}>
      <ToggleContainer>
        <ToggleButton
          isActive={!value}
          onPress={() => onToggle(false)}
        >
          <ToggleText isActive={!value}>Desativado</ToggleText>
        </ToggleButton>
        <ToggleButton
          isActive={value}
          onPress={() => onToggle(true)}
        >
          <ToggleText isActive={value}>Ativado</ToggleText>
        </ToggleButton>
      </ToggleContainer>
    </Container>
  );
};