// src/app/screens/profile/contatosView.tsx
import * as React from 'react';
import { ContatsBackground } from '@/components/HomeProfile/ContatsBackground';
import { ContentContainer } from '@/components/HomeProfile/ContentContainer';
import { ProfileCard } from '@/components/HomeProfile/CardProfileContats';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import { router } from 'expo-router';
import { TouchableOpacity, Text, View } from 'react-native';

const AddCardContainer = styled(TouchableOpacity)`
  margin-top: 20px;
  background-color: white;
  border-radius: 15px;
  padding: 25px;
  align-items: center;
  justify-content: center;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
`;

const AddText = styled(Text)`
  margin-top: 8px;
  font-size: 13px;
  color: ${AppTheme.colors.tertiary};
  font-family: ${AppTheme.fonts.titleMedium.fontFamily};
`;

export default function ContatosView() {
  const contatos = [
    { name: 'João da Silva', relation: 'Pai', phone: '(11) 91234-5678', avatarUri: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Maria Oliveira', relation: 'Mãe', phone: '(11) 98765-4321' },
  ];

  return (
    <ContatsBackground
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("../homeProfile");
        }
      }}
    >

    <ContentContainer>
        {/* 🔁 Lista de contatos */}
        {contatos.map((c, idx) => (
          <ProfileCard
            key={idx}
            name={c.name}
            relation={c.relation}
            phone={c.phone}
            avatarUri={c.avatarUri}
            onEditPress={() => console.log('✏️ Editar', c.name)}
            onDeletePress={() => console.log('🗑️ Excluir', c.name)}
          />
        ))}


  
        {/* ➕ Botão de adicionar */}
       <AddCardContainer onPress={() => router.push("/screens/profile/contatosAdd")}>
        <AddText>Adicionar novo contato de confiança</AddText>
  <Feather name="plus-circle" size={80} color={AppTheme.colors.tertiary} />
  
</AddCardContainer>

      </ContentContainer>
    </ContatsBackground>
  );
}
