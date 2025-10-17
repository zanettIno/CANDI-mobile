import * as React from 'react';
import { useState } from 'react';
import { Text, View, StatusBar, Image, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import LoginSignupBackground from '../components/LoginSignupBackground';
import InputEmail from '../components/Inputs/inputEmail';
import InputPassword from '../components/Inputs/inputPassword';
import InputConfirmPassword from '../components/Inputs/inputConfirmPassword';
import InputPhone from '../components/Inputs/inputPhone';
import InputBirth from '../components/Inputs/inputBirth';
import InputTypeCancer from '../components/Inputs/inputTypeCancer';
import InputName from '../components/Inputs/inputName';
import ButtonCustom from '../components/Buttons/buttonCustom';
import TermsModal from '../components/Modals/TermsModal';
import { useRouter } from 'expo-router';
import BackIconButton from '@/components/BackIconButton';
import { API_BASE_URL } from 'constants/api'; 


const { width } = Dimensions.get('window');

// LEMBRAR DE TROCAR O IP DA MAQUINA
// const endpoint = `http://${process.env.IP}:3000/auth/login`; 
const endpoint = `${API_BASE_URL}/auth/register`;

export default function Cadastro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cancerType, setCancerType] = useState<number | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    cancerType: false,
    birthDate: false,
    password: false,
    confirmPassword: false
  });

  const router = useRouter();

  const handleBirthDateChange = (date: Date | null, text: string) => {
    setBirthDate(text);
  };
  
  const handleRegisterClick = async () => {

    const newErrors = {
      name: name.trim() === '',
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      phone: phone.replace(/\D/g, '').length < 10,
      cancerType: cancerType === null,
      birthDate: !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(birthDate),
      password: !/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password),
      confirmPassword: confirmPassword !== password || confirmPassword === ''
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(err => err);
    if (hasError) {
      Alert.alert("Erro", "Por favor, preencha corretamente todos os campos.");
      return;
    }

    processRegistration();
  };

  const processRegistration = async () => {

    setTermsModalVisible(false);
    setLoading(true);

    try {
      const [day, month, year] = birthDate.split('/');
      const formattedBirthDateForAPI = `${year}-${month}-${day}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          cancer_type_id: cancerType,
          birth_date: formattedBirthDateForAPI,
          password: password,
        }),
      });
    
      const data = await response.json();
    
      if (response.ok) {
        Alert.alert("Sucesso", "Cadastro realizado! Faça login para continuar.");
        router.push('/'); 
      } else {
        const errorMessage = data.message || "Erro ao tentar cadastrar. Verifique os dados.";
        Alert.alert("Erro de Cadastro", errorMessage);
      }
    } catch (error) {
          console.error("Erro na requisição de cadastro:", error);
          Alert.alert("Erro", "Não foi possível conectar ao servidor. Verifique sua conexão.");
        } finally {
          setLoading(false);
        }
  };

  const handleTermsAccept = () => {
    processRegistration();
  };

  const handleTermsDismiss = () => {
    setTermsModalVisible(false);
  };

  return (
    <PaperProvider theme={AppTheme}>
      <View style={[styles.container, { backgroundColor: AppTheme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={AppTheme.colors.primary} />
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <LoginSignupBackground>
            <View style={styles.contentWrapper}>
              
              <View style={styles.logoContainer}>
                <BackIconButton 
                left={-3}
                bottom={50}
                color={AppTheme.colors.cardBackground} 
                onPress={() => router.back()}/>

                <Image
                  source={require('../../assets/images/rosa_clarinho.png')}
                  style={styles.logo}
                />
                
              </View>

              <View style={styles.welcomeContainer}>
                <Text style={[styles.welcomeTitle, { color: AppTheme.colors.textColor }]}>
                  Comece agora!
                </Text>
              </View>

              <View style={styles.formContainer}>
                <InputName
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome"
                  style={{ borderColor: errors.name ? '#ff6b6b' : 'transparent', borderWidth: 1, borderRadius: 50 }}
                />

                <InputEmail
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  style={{ borderColor: errors.email ? '#ff6b6b' : 'transparent', borderWidth: 1, borderRadius: 50 }}
                />

                <InputPhone
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Telefone"
                  style={{ borderColor: errors.phone ? '#ff6b6b' : 'transparent', borderWidth: 1, borderRadius: 50 }}
                />

                <InputTypeCancer
                  value={cancerType}
                  onSelect={setCancerType}
                  placeholder="Tipo do câncer"
                  style={{ borderColor: errors.cancerType ? '#ff6b6b' : 'transparent', borderWidth: 1, borderRadius: 50 }}
                />

                <InputBirth
                  value={birthDate}
                  onChangeText={handleBirthDateChange}
                  placeholder="Data de nascimento"
                  style={{ borderColor: errors.birthDate ? '#ff6b6b' : 'transparent', borderWidth: 1, borderRadius: 50 }}
                />

                <InputPassword
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Senha"
                  style={{ borderColor: errors.password ? '#ff6b6b' : 'transparent', borderWidth: 1, borderRadius: 50 }}
                />

                <InputConfirmPassword
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmar senha"
                  originalPassword={password}
                  style={{ borderColor: errors.confirmPassword ? '#ff6b6b' : 'transparent', borderWidth: 1, borderRadius: 50 }}
                />
              </View>

              <ButtonCustom
                title={loading ? "Cadastrando..." : "Cadastrar"}
                onPress={handleRegisterClick}
                variant="primary"
                disabled={loading}
                style={{ marginTop: '-5%' , marginBottom: 20 }}
              />

            </View>
          </LoginSignupBackground>
        </ScrollView>

        <TermsModal
          visible={termsModalVisible}
          onDismiss={handleTermsDismiss}
          onAccept={handleTermsAccept}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1,
    paddingBottom: 40 
  },
  contentWrapper: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    paddingHorizontal: 20, 
    paddingTop: 20 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: '15%',
    marginTop: 50,
    width: '100%',
    height: width * 0.20
  },
  logo: { 
    width: '60%',
    height: '100%',
    resizeMode: 'contain' 
  },
  welcomeContainer: { 
    marginBottom: 40,
    marginLeft: 0
  },
  welcomeTitle: {
    fontFamily: AppTheme.fonts.headlineMedium.fontFamily,
    fontSize: AppTheme.fonts.displaySmall.fontSize,
  },
  formContainer: { 
    marginBottom: 16,
    bottom: 30
  },
});