import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { AppTheme } from '../../../theme/index';
import { SymptomDropdown } from '@/components/Inputs/FormInputSymptom/SymptomDropdown';
import { DateInput } from '@/components/Inputs/FormInputSymptom/DateInput';
import { OtherSymptomsInput } from '@/components/Inputs/FormInputSymptom/OtherSymptomInput';
import { ReminderToggle } from '@/components/Toggle/ReminderToggle';
import { NotifyNetworkToggle } from '@/components/Toggle/NotifyNetworkToggle';
import { RegisterSymptomButton } from '@/components/Buttons/RegisterSymptomButton';
import BackIconButton from '@/components/BackIconButton';
import { useRouter } from 'expo-router';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.primary};
`;

const Header = styled(View)`
  height: 60px;
  justify-content: center;
  padding-left: 16px;
`;

const FormContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.cardBackground};
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  margin-top: 10px; 
  padding: 32px 24px 24px 24px; 
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

export default function SintomasAdd() {
  const [selectedSymptom, setSelectedSymptom] = React.useState('');
  const [symptomDate, setSymptomDate] = React.useState('');
  const [otherSymptom, setOtherSymptom] = React.useState('');
  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [notifyNetworkEnabled, setNotifyNetworkEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const symptoms = [
    'Enjoo',
    'Dor de cabeça',
    'Febre',
    'Tontura',
    'Náusea',
    'Dor abdominal',
    'Fadiga',
    'Insônia'
  ];

  const handleSymptomSelect = () => {
    setSelectedSymptom('Enjoo');
  };

  const handleDateSelect = () => {
    const today = new Date();
    setSymptomDate(today.toLocaleDateString('pt-BR'));
  };

  const handleAddSymptom = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSelectedSymptom('');
      setSymptomDate('');
      setOtherSymptom('');
      setReminderEnabled(false);
      setNotifyNetworkEnabled(false);

      console.log('Sintoma adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar sintoma:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (selectedSymptom !== '' || otherSymptom.trim() !== '') && symptomDate !== '';

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
          <HeaderTitle>NOVO SINTOMA</HeaderTitle>
          <HeaderSubtitle>Preencha o formulário para registrar um novo sintoma</HeaderSubtitle>

          <FormScrollView showsVerticalScrollIndicator={false}>
            <FirstFieldLabel>Sintoma detectado</FirstFieldLabel>
            <SymptomDropdown
              value={selectedSymptom}
              onPress={handleSymptomSelect}
              placeholder="Enjoo"
            />

            <FieldLabel>Data do sintoma</FieldLabel>
            <DateInput
              value={symptomDate}
              onPress={handleDateSelect}
              placeholder="20/09/2025"
            />

            <FieldLabel>Outro sintoma</FieldLabel>
            <OtherSymptomsInput
              value={otherSymptom}
              onChangeText={setOtherSymptom}
              placeholder="Ressecamento da pele"
            />

            <FieldLabel>Ativar lembrete</FieldLabel>
            <ReminderToggle
              value={reminderEnabled}
              onToggle={setReminderEnabled}
            />

            <FieldLabel>Notificar a rede de apoio</FieldLabel>
            <NotifyNetworkToggle
              value={notifyNetworkEnabled}
              onToggle={setNotifyNetworkEnabled}
            />

            <RegisterSymptomButton
              onPress={handleAddSymptom}
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
