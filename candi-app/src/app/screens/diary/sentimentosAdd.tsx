import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../constants/api'; 
import { AppTheme } from '../../../theme';
import MoodSlider from '../../../components/Sentiments/MoodSlider';
import SentimentCard from '../../../components/Sentiments/SentimentCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const moodStates = [
    { score: 1, emoji: '😞', label: 'Muito Triste' },
    { score: 2, emoji: '😐', label: 'Triste' },
    { score: 3, emoji: '🙂', label: 'Normal' },
    { score: 4, emoji: '😊', label: 'Alegre' },
    { score: 5, emoji: '😄', label: 'Muito Feliz' },
];

const getEmojiByScore = (score) => {
    const mood = moodStates.find(m => m.score === score);
    return mood ? mood.emoji : '❓';
};

const AddSentimentScreen = () => {
  const navigation = useNavigation();

  const [moodValue, setMoodValue] = useState(2); 
  const [observation, setObservation] = useState('');
  const [sentiments, setSentiments] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false); 
  const [error, setError] = useState(null);
  
  // O estado 'userEmail' foi removido, não é mais necessário.

  const fetchFeelings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error("Não autenticado");

      let email = userEmail;
      if (!email) {
          const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true', },
          });
          if (!userResponse.ok) throw new Error("Falha ao buscar usuário");
          const userData = await userResponse.json();
          email = userData.profile_email;
          setUserEmail(email);
      }

      if (!email) throw new Error("E-mail do usuário não encontrado");

      const response = await fetch(`${API_BASE_URL}/journal/feelings/${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`);
      
      const data = await response.json();
      setSentiments(data); 

    } catch (err) {
      console.error("Erro ao buscar sentimentos:", err);
      setError("Não foi possível carregar o diário. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, []); // Removido 'userEmail' das dependências

  useFocusEffect(
    useCallback(() => {
      fetchFeelings();
    }, [fetchFeelings])
  );

  const handleSaveFeeling = async () => {
    if (!observation.trim()) {
        Alert.alert("Atenção", "Por favor, adicione uma observação sobre seu sentimento.");
        return;
    }

    setSaving(true);
    setError(null);

    const happinessScore = moodValue + 1;

    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error("Não autenticado");
        
        const response = await fetch(`${API_BASE_URL}/journal/feelings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
            },
            // ALTERADO: O corpo do pedido já não precisa do e-mail
            body: JSON.stringify({
                happiness: happinessScore,
                observation: observation,
            }),
        });

        if (response.ok) {
            Alert.alert("Sucesso", "Sentimento salvo com sucesso!");
            setObservation('');
            setMoodValue(2); 
            await fetchFeelings(); // Atualiza a lista com o novo sentimento
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Erro ao salvar sentimento.";
            Alert.alert("Erro ao Salvar", errorMessage);
        }

    } catch (err) {
        console.error("Erro ao salvar sentimento:", err);
        Alert.alert("Erro de Conexão", "Não foi possível salvar o sentimento. Verifique sua rede.");
    } finally {
        setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.contentCard}>
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
        >
            <IconButton
              icon="chevron-left"
              iconColor={AppTheme.colors.primary}
              size={32}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            
            <View style={styles.header}>
              <Text style={styles.title }>SEUS SENTIMENTOS</Text>
              <Text style={styles.subtitle}>Insira um novo sentimento para o dia de hoje</Text>
            </View>

            <MoodSlider value={moodValue} onValueChange={setMoodValue}/>

            <Text style={styles.label}>Observação</Text>
            <TextInput
              mode="outlined"
              value={observation}
              onChangeText={setObservation}
              placeholder="Descreva o que sentiu..."
              style={styles.input}
              outlineStyle={styles.inputOutline}
              activeOutlineColor={AppTheme.colors.primary}
              editable={!saving} 
            />

            <Button
              mode="contained"
              onPress={handleSaveFeeling}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              buttonColor={AppTheme.colors.tertiary}
              disabled={saving || loading}
            >
              {saving ? 'Salvando...' : 'Salvar Sentimento'}
            </Button>

            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>LISTA DE SENTIMENTOS</Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 20 }} />
                ) : error ? (
                    <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text>
                ) : sentiments.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: AppTheme.colors.onSurfaceVariant }}>
                        Nenhum sentimento registrado ainda.
                    </Text>
                ) : (
                    sentiments.map((item) => (
                        <SentimentCard 
                            key={item.feeling_id}
                            emoji={getEmojiByScore(item.happiness)} 
                            emotion={moodStates.find(m => m.score === item.happiness)?.label || `Score ${item.happiness}`} 
                            observation={item.observation} 
                            date={new Date(item.created_at).toLocaleDateString('pt-BR')} 
                        />
                    ))
                )}
            </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFC4C4',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    position: 'absolute', 
    top: 15,
    left: 10,
    zIndex: 1, 
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40, 
  },
  title: {
    ...AppTheme.fonts.headlineSmall,
    fontWeight: 'bold',
    color: AppTheme.colors.onSurface,
    paddingTop: 20,
  },
  subtitle: {
    ...AppTheme.fonts.bodyMedium,
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  label: {
    ...AppTheme.fonts.titleSmall,
    fontWeight: 'bold',
    color: AppTheme.colors.onSurface,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F7F7F7',
    marginBottom: 20,
  },
  inputOutline: {
      borderRadius: 16,
      borderWidth: 0,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 32,
  },
  buttonLabel: {
    ...AppTheme.fonts.labelLarge,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 16,
  },
  listTitle: {
    ...AppTheme.fonts.titleMedium,
    fontWeight: 'bold',
    color: AppTheme.colors.onSurface,
    marginBottom: 8,
  }
});

export default AddSentimentScreen;