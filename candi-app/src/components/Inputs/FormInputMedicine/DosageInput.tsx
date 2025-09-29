import React from 'react';
import { TextInput, View } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../../theme'; 

interface DosageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  margin-bottom: 16px;
`;

const StyledTextInput = styled(TextInput)`
  background-color: ${AppTheme.colors.background};
  border-radius: 50px;
  padding: 16px;
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px; 
  color: ${AppTheme.colors.tertinaryTextColor}; 
  border: 1px solid transparent;
`;

export const DosageInput: React.FC<DosageInputProps> = ({
  value,
  onChangeText,
  placeholder = "100 mg",
  style,
}) => {
  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppTheme.colors.placeholderText} 
        keyboardType="default"
      />
    </Container>
  );
};