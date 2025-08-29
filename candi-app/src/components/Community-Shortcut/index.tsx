import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ContainerCommunity = styled(View)`
  background-color: ${AppTheme.colors.tertiaryLight};
  height: 140px;
  width: 350px;
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
  padding: 0 16px;
  height: 50px;
`;

const PublishInput = styled(TextInput).attrs({
  placeholderTextColor: AppTheme.colors.tertinaryTextColor,
})`
  flex: 1;
  font-size: 16px;
  color: ${AppTheme.colors.tertinaryTextColor};
`;

const SendIcon = styled(Ionicons)`
  margin-left: 10px;
  color: ${AppTheme.colors.tertinaryTextColor};
`;

export default function CommunityShortcut() {
  return (
    <PaperProvider>
      <Container>
        <ContainerCommunity>
          <ComunidadeText>Comunidade</ComunidadeText>
          <PublishInputContainer>
            <PublishInput placeholder={"O que deseja publicar?"}/>
            <TouchableOpacity>
                <SendIcon name="paper-plane-outline" size={24} />
            </TouchableOpacity>
          </PublishInputContainer>
        </ContainerCommunity>
      </Container>
    </PaperProvider>
  );
}