// src/app/screens/profile/contatosView.tsx
import * as React from 'react';
import { ContatsBackground } from '@/components/HomeProfile/ContatsBackground';
import { ContentContainer } from '@/components/HomeProfile/ContentContainer';
import { ProfileCard } from '@/components/HomeProfile/CardProfileContats';
import { AppTheme } from '@/theme';
import { router } from 'expo-router';
import { AddContactButton } from '@/components/Buttons/addContactButton';

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

        {/* ➕ Botão de adicionar contato usando AddContactButton */}
        <AddContactButton
          onPress={() => router.push("/screens/profile/contatosAdd")}
          variant="primary"
        />
      </ContentContainer>
    </ContatsBackground>
  );
}
