import * as React from 'react';
// NOVO: Imports adicionados para a lógica
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { AppTheme } from '@/theme';
import { ProfileCard } from '@/components/HomeProfile/CardProfileContats';
import { AddContactButton } from '@/components/Buttons/addContactButton';
import BackIconButton from '@/components/BackIconButton';
// NOVO: Imports para a lógica
import { router, useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.primary};
  justify-content: flex-end;
`;

const Header = styled(View)`
  height: 60px;
  justify-content: center;
  padding-left: 16px;
`;

const ContentCard = styled(View)`
  height: 90%;
  background-color: ${AppTheme.colors.cardBackground};
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  padding: 32px 24px 24px 24px;
`;

const ListScrollView = styled(ScrollView)`
  flex: 1;
`;

export default function ContatosView() {
  const router = useRouter(); // Inicializa o router

  // NOVO: Estados para guardar os contatos e controlar o loading
  const [contatos, setContatos] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // NOVO: Lógica para buscar os dados do banco
  useFocusEffect(
    React.useCallback(() => {
      const fetchContactData = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error("Não autenticado");

          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (response.ok) {
            const userData = await response.json();
            const contactList = [];

            // Verifica se os dados do contato de emergência existem no perfil
            if (userData.emergency_contact_name) {
              contactList.push({
                name: userData.emergency_contact_name,
                relation: userData.emergency_contact_rela, // Usa 'rela' como no backend
                phone: userData.emergency_contact_phone,
              });
            }
            setContatos(contactList);
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
                router.replace("/screens/profile/homeProfile");
              }
            }} 
          />
        </Header>

        <ContentCard>
          <Text style={styles.listTitle}>CONTATOS DE CONFIANÇA</Text>
          
          <ListScrollView>
            {/* ALTERADO: Lógica para exibir loading, lista vazia ou o contato do banco */}
            {isLoading ? (
              <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 50 }} />
            ) : contatos.length > 0 ? (
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
  listTitle: {
    fontSize: AppTheme.fonts.titleLarge.fontSize,
    fontWeight: 'bold',
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    color: AppTheme.colors.nameText,
    marginBottom: 20,
    textAlign: 'center',
  },
  // NOVO: Estilo para a mensagem de lista vazia
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: AppTheme.colors.placeholderText,
  },
});