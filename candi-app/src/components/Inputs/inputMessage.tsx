import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { AppTheme } from '../../theme/index';

const InputContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${AppTheme.colors.cardBackground};
  padding: 8px 12px;
  border-top-width: 1px;
  border-top-color: #e6e6e6;
`;

const MessageBox = styled(View)`
  flex-direction: row;
  align-items: center;
  flex: 1;
  background-color: ${AppTheme.colors.formFieldColor};
  border-radius: 30px;
  padding: 0 10px 0 16px;
  min-height: 44px;
`;

const MessageField = styled(TextInput)`
  flex: 1;
  font-size: 15px;
  color: ${AppTheme.colors.textColor};
  padding-vertical: 8px;
  text-align-vertical: center; /* <-- Correção de alinhamento */
`;

const IconContainer = styled(TouchableOpacity)`
  padding-left: 6px;
`;

interface MessageInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  style?: any; 
}

export const MessageInput: React.FC<MessageInputProps> = ({
  placeholder = 'Digite sua mensagem',
  value,
  onChangeText,
  onSend,
  style,
}) => {
  const isSendDisabled = value.trim().length === 0;

  return (
    <InputContainer style={style}>
      <MessageBox>
        <MessageField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AppTheme.colors.placeholderText}
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
        <IconContainer onPress={onSend} disabled={isSendDisabled}>
          <MaterialCommunityIcons
            name="send"
            size={22}
            color={
              isSendDisabled
                ? AppTheme.colors.placeholderText
                : AppTheme.colors.tertiary
            }
          />
        </IconContainer>
      </MessageBox>
    </InputContainer>
  );
};

export default MessageInput;