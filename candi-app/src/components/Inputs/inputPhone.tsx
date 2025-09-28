import React from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';

interface InputPhoneProps {
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
  background-color: #f5f5f5;
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  font-size: 20px;
  color: #545f71;
  border: 1px solid ${props => props.isValid === false ? '#ff6b6b' : 'transparent'};
`;

const IconContainer = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
`;

const InputPhone: React.FC<InputPhoneProps> = ({
  value,
  onChangeText,
  placeholder = "Telefone",
  style
}) => {
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        return formatted;
      }
    }
    return text;
  };

  const handleChangeText = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  };

  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        keyboardType="phone-pad"
        maxLength={15}
        isValid={value ? isValidPhone(value) : undefined}
      />
      <IconContainer>
        <MaterialIcons name="phone" size={24} color="#545f71" />
      </IconContainer>
    </Container>
  );
};

export default InputPhone;
