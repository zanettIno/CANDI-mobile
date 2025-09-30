import React from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';

interface InputEmailProps {
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

const StyledTextInput = styled(TextInput)<{ isValid?: boolean }>`
  background-color: ${AppTheme.colors.formFieldColor};
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  font-size: 20px;
  color: #545F71;
  border: 1px solid ${props => props.isValid === false ? '#ff6b6b' : 'transparent'};
`;

const IconContainer = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
`;

const InputEmail: React.FC<InputEmailProps> = ({
  value,
  onChangeText,
  placeholder = "Email",
  style
}) => {
  // VALIDAÇÃO: email válido
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        isValid={value ? isValidEmail(value) : undefined}
      />
      <IconContainer>
        <MaterialIcons name="email" size={24} color="#545f71" />
      </IconContainer>
    </Container>
  );
};

export default InputEmail;
