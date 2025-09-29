import React from 'react';
import { TextInput, View } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../../theme'; 

interface ObservationInputProps {
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
  border: 1px solid transparent;
  padding: 16px;
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
`;

export const ObservationInput: React.FC<ObservationInputProps> = ({
  value,
  onChangeText,
  placeholder = "Observações (ex: consumir em jejum)",
  style,
}) => {
  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppTheme.colors.placeholderText}
      />
    </Container>
  );
};