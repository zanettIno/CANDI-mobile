import React from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';

interface InputNameProps {
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

const InputName: React.FC<InputNameProps> = ({
  value,
  onChangeText,
  placeholder = "Nome",
  style
}) => {
  // VALIDAÇÃO: nome não vazio e apenas letras e espaços
  const isValidName = (name: string) => /^[A-Za-zÀ-ÿ\s]+$/.test(name);

  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999" 
        keyboardType="default"
        autoCapitalize="words"
        autoCorrect={false}
        isValid={value ? isValidName(value) : undefined}
      />
      <IconContainer>
        <MaterialIcons name="person" size={24} color="#545f71" />
      </IconContainer>
    </Container>
  );
};

export default InputName;
