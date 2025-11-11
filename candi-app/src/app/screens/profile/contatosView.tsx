import * as React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { AppTheme } from '@/theme';
import { ProfileCard } from '@/components/HomeProfile/CardProfileContats';
import { AddContactButton } from '@/components/Buttons/addContactButton';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';
import BackIconButton from '@/components/BackIconButton';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.primary};
  justify-content: flex-end;
`;

const Header = styled(View)`
  height: 60px;
  flex-direction: row;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
`;

const HeaderTitle = styled(Text)`
  flex: 1;
  text-align: center;
  font-size: ${AppTheme.fonts.titleLarge.fontSize}px;
  font-weight: bold;
  color: ${AppTheme.colors.cardBackground};
  margin-left: -30px; 
`;

const ContentCard = styled(View)`
  height: 90%;
  background-color: ${AppTheme.colors.cardBackground};
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ListScrollView = styled(ScrollView)`
  flex: 1;
  margin-bottom: 20px;
`;

export default function ContatosView() {
  const router = useRouter(); 

  const [contatos, setContatos] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchContactData = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error("Não autenticado");

          // ALTERADO: Endpoint agora é a nova rota GET
          const response = await fetch(`${API_BASE_URL}/emergency-contact`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (response.ok) {
            // A API agora retorna uma LISTA de contatos
            const contactsData = await response.json();
            
            // Mapeamos a lista para o formato que o Card espera
            const formattedContacts = contactsData.map(contact => ({
              name: contact.name,
              relation: contact.relationship,
              phone: contact.phone,
            }));
            
            setContatos(formattedContacts);
          } else {
            throw new Error("Falha ao buscar os contatos");
          }
        } catch (error) {
          console.error("Erro ao buscar contato:", error);
          setContatos([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchContactData();
    }, [])
  );

  return (
    <PaperProvider theme={AppTheme}>
      <Container>
        <Header>
          <BackIconButton 
            color={AppTheme.colors.cardBackground} 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/screens/home/homeProfile");
              }
            }} 
          />
          <HeaderTitle>Contatos de Confiança</HeaderTitle>
        </Header>

        <ContentCard>
          <ListScrollView>
            {isLoading ? (
              <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 50 }} />
            ) : contatos.length > 0 ? (
              // O .map() agora vai renderizar todos os contatos da lista
              contatos.map((c, idx) => (
                <ProfileCard
                  key={idx}
                  name={c.name}
                  relation={c.relation}
                  phone={c.phone}
                  avatarUri={c.avatarUri}
                  onEditPress={() => console.log('✏️ Editar', c.name)}
                  onDeletePress={() => console.log('🗑️ Excluir', c.name)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum contato de confiança adicionado.</Text>
            )}
          </ListScrollView>

          <AddContactButton
            onPress={() => router.push("/screens/profile/contatosAdd")}
            variant="primary"
          />
        </ContentCard>
      </Container>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: AppTheme.colors.placeholderText,
  },
  listTitle: { // Adicionando o estilo que faltava para o título
    fontSize: AppTheme.fonts.titleLarge.fontSize,
    fontWeight: 'bold',
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    color: AppTheme.colors.nameText,
    marginBottom: 20,
    textAlign: 'center',
  },
});