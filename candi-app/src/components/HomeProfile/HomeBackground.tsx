// src/components/HomeProfile/HomeBackground.tsx
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { router } from 'expo-router';

const Container = styled(View)`
  flex: 1;
  position: relative;
`;

const RedBackground = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%; /* força ocupar largura total */
  align-self: stretch; /* garante que não vai sobrar gap */
  height: 220px;
  background-color: ${AppTheme.colors.secondary};
  z-index: -1;
`;


const Header = styled(View)`
  width: 100%;
  padding: 20px;
  justify-content: flex-start;
  align-items: flex-end;
`;

const ContentWrapper = styled(View)`
  flex: 1;
  background-color: white;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  padding: 20px;
  margin-top: 30px;
  position: relative;
`;

export const HomeBackground = ({
  children,
  onSettingsPress,
}: {
  children: React.ReactNode;
  onSettingsPress: () => void;
}) => {
  return (
    <Container>
      {/* 🔴 fundo absoluto */}
      <RedBackground />

      {/* 🔧 ícone engrenagem */}
      <Header>
        <TouchableOpacity onPress={() => {
        
                router.push("/screens/profile/settings");
              
            }}>
          <Feather name="settings" size={28} color="black" />
        </TouchableOpacity>
      </Header>

      {/* 📦 conteúdo branco */}
      <ContentWrapper>{children}</ContentWrapper>
    </Container>
  );
};
