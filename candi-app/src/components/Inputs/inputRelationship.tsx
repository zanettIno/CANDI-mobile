import React from 'react';
import { TextInput, View } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme/index';

interface InputRelationshipProps {
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

const IconContainer = styled(View)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
`;

const InputRelationship: React.FC<InputRelationshipProps> = ({
  value,
  onChangeText,
  placeholder = "Amigo(a), Parente, etc.",
  style
}) => {
  return (
    <Container style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999" 
        keyboardType="default"
        autoCapitalize="sentences"
        autoCorrect={false}
      />
      <IconContainer>
        <MaterialIcons name="label" size={24} color="#545f71" />
      </IconContainer>
    </Container>
  );
};

export default InputRelationship;
