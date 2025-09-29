import React from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../../theme'; 

interface PosologyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
`;

const StyledTextInput = styled(TextInput)`
  background-color: ${AppTheme.colors.background};
  border-radius: 50px;
  padding: 16px 50px 16px 16px; 
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily}; 
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px; 
  color: ${AppTheme.colors.tertinaryTextColor}; 
  border: 1px solid transparent;
`;

const IconContainer = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
`;

export const PosologyInput: React.FC<PosologyInputProps> = ({
  value,
  onChangeText,
  placeholder = "A cada 8h",
  style
}) => {
  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppTheme.colors.placeholderText} 
        autoCorrect={false}
      />
      <IconContainer>
        <MaterialIcons 
          name="access-time" 
          size={24} 
          color={AppTheme.colors.tertinaryTextColor} 
        />
      </IconContainer>
    </Container>
  );
};