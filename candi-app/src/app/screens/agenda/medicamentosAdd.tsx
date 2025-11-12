import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { AppTheme } from '../../../theme/index';
import { MedicineNameInput } from '@/components/Inputs/FormInputMedicine/MedicineNameInput';
import { DosageInput } from '@/components/Inputs/FormInputMedicine/DosageInput';
import { PosologyInput } from '@/components/Inputs/FormInputMedicine/PosologyInput';
import { PeriodInput } from '@/components/Inputs/FormInputMedicine/PeriodInput';
import { ObservationInput } from '@/components/Inputs/FormInputMedicine/ObservationInput';
import { RegisterMedicineButton } from '@/components/Buttons/RegisterMedicineButton';
import BackIconButton from '@/components/BackIconButton';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.secondary};
`;

const Header = styled(View)`
  height: 60px;
  justify-content: center;
  align-items: flex-start;
  padding-left: 16px;
  padding-top: 0px;
  top: 15px;
`;

const FormContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.cardBackground};
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  margin-top: 10px;
  padding: 24px;
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

const FormScrollView = styled(ScrollView)`
  flex: 1;
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

export default function MedicamentosAdd() {
  const [medicineName, setMedicineName] = React.useState('');
  const [dosage, setDosage] = React.useState('');
  const [posology, setPosology] = React.useState('');
  const [period, setPeriod] = React.useState('');
  const [observation, setObservation] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const router = useRouter();

  const handleAddMedicine = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert("Erro", "Você não está autenticado.");
        setLoading(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/schedule/medicines`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // O e-mail foi removido, o backend identifica o usuário pelo token
          medicine_name: medicineName,
          medicine_dosage: dosage,
          medicine_posology: posology,
          medicine_period: period,
          medicine_obs: observation,
        }),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Medicamento adicionado com sucesso!');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Não foi possível adicionar o medicamento.');
      }
    } catch (error) {
      console.error('Erro ao adicionar medicamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = medicineName.trim() !== '' && dosage.trim() !== '';

  return (
    <PaperProvider>
      <Container>
        <Header>
          <BackIconButton 
            color={AppTheme.colors.cardBackground} 
            onPress={() => router.back()} 
          />
        </Header>

        <FormContainer>
          <HeaderTitle>NOVO MEDICAMENTO</HeaderTitle>
          <HeaderSubtitle>
            Preencha o formulário para cadastrar um novo medicamento
          </HeaderSubtitle>
          
          <FormScrollView showsVerticalScrollIndicator={false}>
            <FirstFieldLabel>Nome do medicamento</FirstFieldLabel>
            <MedicineNameInput
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder="Medicamento X"
            />

            <FieldLabel>Dosagem</FieldLabel>
            <DosageInput
              value={dosage}
              onChangeText={setDosage}
              placeholder="100 mg"
            />

            <FieldLabel>Posologia (frequência de consumo)</FieldLabel>
            <PosologyInput
              value={posology}
              onChangeText={setPosology}
              placeholder="A cada 8h"
            />

            <FieldLabel>Período</FieldLabel>
            <PeriodInput
              value={period}
              onChangeText={setPeriod}
              placeholder="Por uma semana"
            />

            <FieldLabel>Observação</FieldLabel>
            <ObservationInput
              value={observation}
              onChangeText={setObservation}
              placeholder="Consumir em jejum"
            />

            <RegisterMedicineButton
              onPress={handleAddMedicine}
              disabled={!isFormValid || loading}
              loading={loading}
              style={{ marginTop: 24 }}
            />
          </FormScrollView>
        </FormContainer>
      </Container>
    </PaperProvider>
  );
}