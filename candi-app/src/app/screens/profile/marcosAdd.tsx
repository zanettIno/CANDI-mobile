import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '../../../theme/index';
import BackIconButton from '@/components/BackIconButton';
import { MilestoneDescriptionInput } from '@/components/Inputs/inputCheckpointDescription';
import { AddMilestoneButton } from '@/components/Buttons/addCheckpointButton'; 
import { API_BASE_URL } from '../../../constants/api';
import { DateInput } from '@/components/Inputs/FormInputSymptom/DateInput';
import { CheckpointCompletedToggle } from '@/components/Toggle/CheckpointCompletedToggle'; 

// Estilos mantidos da versão anterior
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

const FormScrollView = styled(ScrollView)`
  flex: 1;
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

const BodyText = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
  line-height: 20px;
  margin-bottom: 16px;
`;

const SmallText = styled(Text)`
  font-family: ${AppTheme.fonts.bodySmall.fontFamily};
  font-size: ${AppTheme.fonts.bodySmall.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
  line-height: 18px;
  margin-bottom: 24px;
`;

// Novo estilo para as labels dos inputs, baseado na imagem
const InputLabel = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: bold;
  color: ${AppTheme.colors.nameText}; /* Cor mais escura para destaque, AppTheme.colors.nameText parece ser a cor do título */
  margin-bottom: 8px;
  margin-left: 0; /* Removendo o marginLeft de 16px que estava na versão anterior */
`;


export default function MarcosAdd() {
    const router = useRouter();
    const userEndpoint = `${API_BASE_URL}/auth/me`;

    const [description, setDescription] = React.useState('');
    const [milestoneDate, setMilestoneDate] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false); 
    const [userUid, setUserUid] = React.useState('');

    React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("entrou no try")
        const token = await AsyncStorage.getItem('accessToken');

        if (!token) {
          console.log("nao achou token")
          return;
        }

        const response = await fetch(userEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          console.log("recebemos data")
          const data = await response.json();
          setUserUid(data.profile_id);
        } else {
          console.error("Erro ao buscar dados do usuário: ", response.status);
        }
      } catch (error) {
        console.error("Erro de conexão ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

    const handleDateSelect = () => {
        // CORREÇÃO: Em um app React Native real, esta função deveria abrir um DatePicker
        // e setar a data selecionada. Mantendo a lógica original para não quebrar o fluxo.
        const today = new Date();
        setMilestoneDate(today.toLocaleDateString('pt-BR'));
        Alert.alert('Data Selecionada', `Data do marco definida para: ${today.toLocaleDateString('pt-BR')}`);
    };

    const handleAddMilestone = async () => {
    if (!description.trim() || !milestoneDate) {
        Alert.alert('Atenção', 'Por favor, preencha a descrição e a data do marco.');
        return;
    }

    setLoading(true);
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            Alert.alert("Erro de Autenticação", "Você não está autenticado.");
            setLoading(false);
            return;
        }

        const endpoint = `${API_BASE_URL}/milestones`;

        // Converter data de dd/MM/yyyy para ISO se necessário
        const isoDate = convertToISO(milestoneDate); // Implemente esta função ou use new Date()

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: description.trim(),
                description: '', 
                date: isoDate, // ou milestoneDate se já estiver no formato correto
                type: 'custom',
                position: null,
                profile_id: userUid,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            Alert.alert('Sucesso', data.message || 'Marco registrado com sucesso!');
            router.back();
        } else {
            const errorData = await response.json();
            Alert.alert('Erro', errorData.message || 'Não foi possível registrar o marco.');
        }
    } catch (error) {
        console.error('Erro ao adicionar marco:', error);
        Alert.alert('Erro', 'Ocorreu um erro de rede. Tente novamente.');
    } finally {
        setLoading(false);
    }
};

const convertToISO = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
};

    const isFormValid = description.trim() !== '' && milestoneDate !== '';

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
                    <HeaderTitle>NOVO MARCO NO TRATAMENTO!</HeaderTitle>

                    <FormScrollView showsVerticalScrollIndicator={false}>

                        <BodyText>
                            Cada etapa da sua jornada é única e merece ser lembrada com carinho.
                            Registrar seus marcos é uma forma de celebrar conquistas, reconhecer
                            o quanto você já avançou e guardar momentos importantes do tratamento
                        </BodyText>

                        <SmallText>
                            Preencha o formulário para cadastrar um novo marco no tratamento
                        </SmallText>

                        {/* Label para Descrição do Marco */}
                        <InputLabel>Descrição do marco</InputLabel>
                        <MilestoneDescriptionInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Última quimioterapia do tratamento"
                            style={{ marginBottom: 24 }} // Aumentando a margem para separar do próximo item
                        />

                        {/* Label para Data do Marco */}
                        <InputLabel>Data do marco</InputLabel>
                        <DateInput
                            value={milestoneDate}
                            onPress={handleDateSelect}
                            placeholder="25/10/2025"
                            style={{ marginBottom: 24 }}
                        />

                        <CheckpointCompletedToggle
                            value={isCompleted}
                            onToggle={setIsCompleted}
                            style={{ marginBottom: 24 }}
                        />

                        <AddMilestoneButton
                            onPress={handleAddMilestone}
                            disabled={!isFormValid || loading}
                            loading={loading}
                            style={{ marginTop: 24, marginBottom: 40 }}
                        />
                    </FormScrollView>
                </FormContainer>
            </Container>
        </PaperProvider>
    );
}
