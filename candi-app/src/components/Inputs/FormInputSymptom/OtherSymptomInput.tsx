import React from 'react';
import { TextInput, View } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../../theme';

interface OtherSymptomsInputProps {
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
  padding: 16px;
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
  border: 1px solid transparent;
`;

export const OtherSymptomsInput: React.FC<OtherSymptomsInputProps> = ({
  value,
  onChangeText,
  placeholder = "Outro sintoma",
  style
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