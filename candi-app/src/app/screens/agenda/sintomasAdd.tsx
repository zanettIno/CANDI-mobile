import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { PaperProvider, Menu } from 'react-native-paper';
import styled from 'styled-components/native';
import { AppTheme } from '../../../theme/index';
import { DateInput } from '@/components/Inputs/FormInputSymptom/DateInput';
import { OtherSymptomsInput } from '@/components/Inputs/FormInputSymptom/OtherSymptomInput';
import { ReminderToggle } from '@/components/Toggle/ReminderToggle';
import { NotifyNetworkToggle } from '@/components/Toggle/NotifyNetworkToggle';
import { RegisterSymptomButton } from '@/components/Buttons/RegisterSymptomButton';
import BackIconButton from '@/components/BackIconButton';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api'; 

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

const DropdownContainer = styled(View)`
  position: relative;
`;

const StyledInputLike = styled(TouchableOpacity)`
  background-color: ${AppTheme.colors.formFieldColor};
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  font-size: 20px;
  justify-content: center;
  border: 1px solid transparent;
`;

const InputText = styled(Text)<{ hasValue: boolean }>`
  font-size: 20px;
  color: ${props => props.hasValue ? AppTheme.colors.textColor : '#545f71'};
`;

const IconContainer = styled(View)`
  position: absolute;
  right: 16px;
  top: 50%;
  margin-top: -12px;
`;

export default function SintomasAdd() {
  const [selectedSymptom, setSelectedSymptom] = React.useState('');
  const [symptomDate, setSymptomDate] = React.useState('');
  const [otherSymptom, setOtherSymptom] = React.useState('');
  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [notifyNetworkEnabled, setNotifyNetworkEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isMenuVisible, setMenuVisible] = React.useState(false);
  
  const router = useRouter();

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          Alert.alert("Erro de Autenticação", "Sessão inválida. Por favor, faça login novamente.");
          router.push('/');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}`,
                      'ngrok-skip-browser-warning': 'true', },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserEmail(userData.profile_email);
        } else {
          throw new Error("Falha ao autenticar o usuário.");
        }
      } catch (e) {
        console.error("Erro ao carregar dados do usuário:", e);
        Alert.alert("Erro", "Não foi possível carregar os seus dados de usuário. Tente novamente.");
      }
    };
    fetchUserData();
  }, []);

  const symptoms = [
    'Enjoo', 'Dor de cabeça', 'Febre', 'Tontura', 'Náusea', 'Dor abdominal', 'Fadiga', 'Insônia'
  ];

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleSymptomSelect = (symptom: string) => {
    setSelectedSymptom(symptom);
    closeMenu();
  };

  const handleDateSelect = () => {
    const today = new Date();
    setSymptomDate(today.toLocaleDateString('pt-BR'));
  };

  const handleAddSymptom = async () => {
    const parts = [];
    if (selectedSymptom) {
      parts.push(selectedSymptom);
    }
    if (otherSymptom.trim()) {
      parts.push(otherSymptom.trim());
    }
    const description = parts.join(', ');
    
    if (!description) {
      Alert.alert('Erro', 'Por favor, selecione ou descreva um sintoma.');
      return;
    }
    if (!userEmail) {
      Alert.alert('Aguarde', 'As informações de usuário ainda estão a ser carregadas. Tente novamente em um instante.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const endpoint = `${API_BASE_URL}/schedule/symptoms`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          email: userEmail,
          description: description,
        }),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Sintoma registado com sucesso!');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Não foi possível registar o sintoma.');
      }
    } catch (error) {
      console.error('Erro ao adicionar sintoma:', error);
      Alert.alert('Erro', 'Ocorreu um erro de rede. Tente novamente.');
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
            
            <DropdownContainer>
              <Menu
                visible={isMenuVisible}
                onDismiss={closeMenu}
                anchor={
                  <StyledInputLike onPress={openMenu} activeOpacity={0.8}>
                    <InputText hasValue={!!selectedSymptom}>
                      {selectedSymptom || "Selecione um sintoma"}
                    </InputText>
                    <IconContainer>
                      <MaterialIcons name="arrow-drop-down" size={24} color="#545f71" />
                    </IconContainer>
                  </StyledInputLike>
                }
              >
                {symptoms.map((symptom) => (
                  <Menu.Item
                    key={symptom}
                    onPress={() => handleSymptomSelect(symptom)}
                    title={symptom}
                  />
                ))}
              </Menu>
            </DropdownContainer>

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
              disabled={!isFormValid || !userEmail}
              loading={loading}
              style={{ marginTop: 24 }}
            />
          </FormScrollView>
        </FormContainer>
      </Container>
    </PaperProvider>
  );
}