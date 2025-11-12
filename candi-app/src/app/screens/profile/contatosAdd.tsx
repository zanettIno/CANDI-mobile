import * as React from 'react';
import { View, Text, ScrollView, Alert, SafeAreaView } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { AppTheme } from '@/theme'; 
import InputName from '../../../components/Inputs/inputName'; 
import InputPhone from '../../../components/Inputs/inputPhone'; 
import InputRelationship from '../../../components/Inputs/inputRelationship'; 
import { AddContactButton } from '../../../components/Buttons/addContactButton'; 
import BackIconButton from '@/components/BackIconButton';
import { useRouter } from 'expo-router';
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

const FormContainer = styled(View)`
  height: 85%;
  background-color: ${AppTheme.colors.cardBackground};
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  padding: 32px 24px 24px 24px;
`;

const FormScrollView = styled(ScrollView)`
  flex-grow: 1;
`;

const HeaderTitle = styled(Text)`
  font-family: ${AppTheme.fonts.titleLarge.fontFamily};
  font-size: ${AppTheme.fonts.titleLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.titleLarge.fontWeight};
  color: ${AppTheme.colors.nameText};
  margin-bottom: 8px;
`;

const HeaderSubtitle = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
  line-height: 20px;
  margin-bottom: 24px;
`;

const FieldLabel = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: 600;
  color: ${AppTheme.colors.nameText};
  margin-bottom: 8px;
  margin-top: 16px;
`;

const FirstFieldLabel = styled(FieldLabel)`
  margin-top: 0px;
`;

export default function ContatosAdd() {
  const router = useRouter();

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [relationship, setRelationship] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // REMOVIDO: O estado e o useEffect para buscar o userId não são mais necessários

  const isValidName = (name: string) => /^[A-Za-zÀ-ÿ\s]+$/.test(name) && name.trim().length > 0;
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  };

  const isButtonDisabled = !isValidName(name) || !isValidPhone(phone);

  const handleAddContact = async () => {
    if (isButtonDisabled) {
      Alert.alert("Campos inválidos", "Por favor, preencha o nome e o telefone corretamente.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error("Não autenticado");

      // ALTERADO: A rota agora é a nova rota base, sem ID
      const endpoint = `${API_BASE_URL}/emergency-contact`;

      const response = await fetch(endpoint, {
        method: 'POST', // ALTERADO: De PATCH para POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // O backend espera 'rela', mas o seu DTO e o frontend usam 'relationship'.
          // Vou manter 'relationship' pois é o que está no seu DTO.
          emergency_contact_name: name,
          emergency_contact_phone: phone,
          emergency_contact_relationship: relationship,
        }),
      });

      if (response.ok) {
        Alert.alert('Sucesso!', 'Novo contato de confiança adicionado.');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || "Não foi possível adicionar o contato.");
      }
    } catch (error) {
      console.error("Erro ao adicionar contato:", error);
      Alert.alert('Erro de Rede', "Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

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

        <FormContainer>
          <HeaderTitle>NOVO CONTATO DE CONFIANÇA</HeaderTitle>
          <HeaderSubtitle>
            O contato de confiança é uma pessoa próxima que poderá ser acionada em situações de emergência ou quando for necessário.
          </HeaderSubtitle>

          <FormScrollView showsVerticalScrollIndicator={false}>
            <FirstFieldLabel>Nome do contato</FirstFieldLabel>
            <InputName
              value={name}
              onChangeText={setName}
              placeholder="Nome do contato"
              style={{ margin: 0 }}
            />

            <FieldLabel>Telefone</FieldLabel>
            <InputPhone
              value={phone}
              onChangeText={setPhone}
              placeholder="Telefone"
              style={{ margin: 0 }}
            />

            <FieldLabel>Identificação</FieldLabel>
            <InputRelationship
              value={relationship}
              onChangeText={setRelationship}
              placeholder="Ex: Amigo(a)"
              style={{ margin: 0 }}
            />
            
            <AddContactButton
              onPress={handleAddContact}
              loading={isLoading}
              // ALTERADO: 'disabled' simplificado
              disabled={isButtonDisabled || isLoading}
              style={{ marginTop: 24 }}
            />
          </FormScrollView>
        </FormContainer>
      </Container>
    </PaperProvider>
  );
}