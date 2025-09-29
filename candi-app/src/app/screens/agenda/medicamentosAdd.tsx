import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
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
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMedicineName('');
      setDosage('');
      setPosology('');
      setPeriod('');
      setObservation('');

      console.log('Medicamento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar medicamento:', error);
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
              disabled={!isFormValid}
              loading={loading}
              style={{ marginTop: 24 }}
            />
          </FormScrollView>
        </FormContainer>
      </Container>
    </PaperProvider>
  );
}
