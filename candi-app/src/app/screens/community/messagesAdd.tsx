import React, { useState } from 'react';
import { View, Text, FlatList, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native'; 
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import SearchInput from '@/components/Inputs/inputSearch';
import ContactCard from '@/components/Card/contactCard';
import HomeBackground from '@/components/HomeBackground';
import { useRouter } from 'expo-router';

const MOCK_CONTACTS = [
  { id: '1', name: 'Dr. João Silva', role: 'Médico Oncologista' },
  { id: '2', name: 'Maria Oliveira', role: 'Amiga de Apoio' },
  { id: '3', name: 'Clínica Bem Estar', role: 'Clínica de Fisioterapia' },
  { id: '4', name: 'Pedro Souza', role: 'Psicólogo' },
];


const ScreenContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.background};
`;

const HeaderContainer = styled(View)`
  padding: 16px;
  padding-top: 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TitleText = styled(Text)`
  font-size: ${AppTheme.fonts.headlineMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.headlineMedium.fontWeight};
  color: ${AppTheme.colors.textColor};
`;

const ListContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.cardBackground}; 
`;


export const NewConversationScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const router = useRouter();

  const filteredContacts = MOCK_CONTACTS.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <HomeBackground />

      <View style={{ flex: 1, marginTop: -120 }}> 
        <HeaderContainer>

         <TouchableOpacity onPress={() => router.navigate('/screens/community/messagesAdd')}>
            <MaterialIcons name="add" size={26} color={AppTheme.colors.textColor} />
         </TouchableOpacity>

          <TitleText>NOVA CONVERSA</TitleText>
          <View style={{ width: 24 }} /> 
        </HeaderContainer>

        <SearchInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Pesquisar Contato"
          style={{ marginHorizontal: 16, marginBottom: 16 }}
        />

        <ListContainer>
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContactCard
                userName={item.name}
                subtitle={item.role}
                onPress={() => console.log('Iniciar chat com:', item.name)}
              />
            )}
            contentContainerStyle={{ paddingTop: 0 }}
          />
        </ListContainer>
      </View>
    </ScreenContainer>
  );
};

export default NewConversationScreen;