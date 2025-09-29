// src/components/HomeProfile/HomeBackground.tsx
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { router } from 'expo-router';
import { Text } from 'react-native';

const Header = styled(View)`
  width: 100%;
  padding: 20px;
  flex-direction: row; /* 👈 icone e texto ficam lado a lado */
  align-items: center;
`;


const Container = styled(View)`
  flex: 1;
  position: relative;
`;

const RedBackground = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  align-self: stretch;
  height: 220px;
  background-color: ${AppTheme.colors.primary};
  z-index: -1;
`;


const ContentWrapper = styled(View)`
  flex: 1;
  background-color: white;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  padding: 20px;
  margin-top: 0px;
  position: relative;
`;

export const ContatsBackground = ({
  children,
  onBackPress,
}: {
  children: React.ReactNode;
  onBackPress?: () => void;
}) => {
  return (
    <Container>
      {/* 🔴 fundo absoluto */}
      <RedBackground />

      {/* 🔙 botão voltar */}
      <Header>
      
<TouchableOpacity
  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
  onPress={() => {
    if (onBackPress) {
      onBackPress();
    } else {
      // se tiver histórico, volta
      if (router.canGoBack()) {
        router.back();
      } else {
        // se não, manda pra homeProfile
        router.replace("../homeProfile");
      }
    }
  }}
>
  <Feather name="arrow-left" size={24} color="white" />
  <Text style={{ fontSize: 26, color: 'white' }}>Contatos de Confiança</Text>
</TouchableOpacity>

      </Header>

      {/* 📦 conteúdo branco */}
      <ContentWrapper>{children}</ContentWrapper>
    </Container>
  );
};
