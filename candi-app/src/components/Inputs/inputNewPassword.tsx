import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';

interface InputNewPasswordProps {
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

const InputNewPassword: React.FC<InputNewPasswordProps> = ({
  value,
  onChangeText,
  placeholder = "Nova senha",
  style
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // VALIDAÇÃO: no mínimo 8 caracteres, letra maiúscula, número e caracter especial
  const isValidPassword = (password: string) => 
    /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!isPasswordVisible}
        placeholderTextColor="#999" 
        autoCapitalize="none"
        autoCorrect={false}
        isValid={value ? isValidPassword(value) : undefined}
      />
      <IconContainer onPress={togglePasswordVisibility}>
        <MaterialIcons 
          name={isPasswordVisible ? "visibility" : "visibility-off"} 
          size={24} 
          color="#545f71" 
        />
      </IconContainer>
    </Container>
  );
};

export default InputNewPassword;
