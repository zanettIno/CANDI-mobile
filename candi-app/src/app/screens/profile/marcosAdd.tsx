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

export default function MarcosAdd() {
    const router = useRouter();

    const [description, setDescription] = React.useState('');
    const [milestoneDate, setMilestoneDate] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);

    const handleDateSelect = () => {
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

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    description: description.trim(),
                    date: milestoneDate,
                }),
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Marco registrado com sucesso!');
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

                        <MilestoneDescriptionInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Última quimioterapia do tratamento"
                            style={{ marginBottom: 16 }}
                        />

                        <BodyText style={{ fontWeight: 'bold', marginBottom: 8, marginLeft: 16 }}>
                            Data do marco
                        </BodyText>
                        <DateInput
                            value={milestoneDate}
                            onPress={handleDateSelect}
                            placeholder="25/10/2025"
                            style={{ marginBottom: 24 }}
                        />

                        <CheckpointCompletedToggle
                            value={false}
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
