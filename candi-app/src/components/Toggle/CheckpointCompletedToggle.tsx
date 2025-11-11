import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Switch } from 'react-native-paper';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme'; 

interface CheckpointCompletedProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  style?: any;
}

const ToggleContainer = styled(TouchableOpacity)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${AppTheme.colors.background}; 
  border-radius: 50px;
  margin-bottom: 16px;
  min-height: 56px; 
`;

const ToggleText = styled(Text)`
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
`;

export const CheckpointCompletedToggle: React.FC<CheckpointCompletedProps> = ({
  value,
  onToggle,
  style
}) => {
  return (
    <ToggleContainer style={style} activeOpacity={0.8} onPress={() => onToggle(!value)}>
      <ToggleText>Marco já concluído</ToggleText>
      <Switch
        value={value}
        onValueChange={onToggle}
        color={AppTheme.colors.tertiary} 
      />
    </ToggleContainer>
  );
};
