import React from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';

interface InputCodeProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
  margin: 16px;
`;

const StyledTextInput = styled(TextInput)`
  background-color: ${AppTheme.colors.formFieldColor};
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  font-size: 20px;
  color: #545F71;
  border: 1px solid transparent;
`;

const IconContainer = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
`;

const InputCode: React.FC<InputCodeProps> = ({
  value,
  onChangeText,
  placeholder = "Código",
  style
}) => {
  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType="numeric"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <IconContainer>
        <MaterialIcons name="vpn-key" size={24} color="#545f71" />
      </IconContainer>
    </Container>
  );
};

export default InputCode;
