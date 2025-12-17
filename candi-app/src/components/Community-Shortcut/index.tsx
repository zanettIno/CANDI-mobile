import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme'; 
import { Ionicons } from '@expo/vector-icons'; 

interface CommunityShortcutProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading: boolean;
}

const ContainerCommunity = styled(View)`
  background-color: ${AppTheme.colors.tertiaryLight};
  width: 100%; 
  height: 140px; 
  border-radius: 20px; 
  padding: 20px; 
  justify-content: space-between;
`;

const ComunidadeText = styled(Text)`
  color: ${AppTheme.colors.tertinaryTextColor};
  font-size: 26px; 
  font-weight: bold;
  margin-bottom: 10px; 
`;

const PublishInputContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  background-color: ${AppTheme.colors.background};
  border-radius: 25px;
  padding-left: 16px; 
  padding-right: 16px;
  padding-top: 0px;
  padding-bottom: 0px;
  height: 50px; 
`;

const PublishInput = styled(TextInput).attrs({
  placeholderTextColor: AppTheme.colors.tertinaryTextColor,
  style: Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined,
})`
  flex: 1;
  font-size: 16px; 
  color: ${AppTheme.colors.tertinaryTextColor};
`;

const SendIcon = styled(Ionicons)`
  margin-left: 10px; 
  color: ${AppTheme.colors.tertinaryTextColor};
`;

const CommunityShortcut: React.FC<CommunityShortcutProps> = ({ 
  value, 
  onChangeText, 
  onSend, 
  loading 
}) => {
  const isSendDisabled = !value.trim() || loading;

  return (
    <ContainerCommunity>
      <ComunidadeText>Comunidade</ComunidadeText>
      <PublishInputContainer>
        <PublishInput 
          placeholder={"O que deseja publicar?"}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
          multiline={false} 
          returnKeyType="send"
          onSubmitEditing={onSend} 
        />
        <TouchableOpacity 
          onPress={onSend}
          disabled={isSendDisabled}
          style={{ opacity: isSendDisabled ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={AppTheme.colors.tertinaryTextColor} />
          ) : (
            <SendIcon name="paper-plane-outline" size={24} />
          )}
        </TouchableOpacity>
      </PublishInputContainer>
    </ContainerCommunity>
  );
};

export default CommunityShortcut;