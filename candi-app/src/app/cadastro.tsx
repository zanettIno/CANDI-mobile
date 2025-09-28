import * as React from 'react';
import { useState } from 'react';
import { Text, View, SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';

export default function Cadastro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [termsModalVisible, setTermsModalVisible] = useState(false);

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

  const handleBack = () => router.back();

  const handleBirthDateChange = (date: Date | null, text: string) => {
    setBirthDate(text);
  };

  const handleRegisterClick = () => {
    // Validações
    const newErrors = {
      name: name.trim() === '',
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      phone: phone.replace(/\D/g, '').length < 10,
      cancerType: cancerType.trim() === '',
      birthDate: !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(birthDate),
      password: !/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password),
      confirmPassword: confirmPassword !== password || confirmPassword === ''
    };

    setErrors(newErrors);

    // Se houver algum erro, mostra alerta
    const hasError = Object.values(newErrors).some(err => err);
    if (hasError) {
      Alert.alert("Erro", "Por favor, preencha corretamente todos os campos.");
      return;
    }

    setTermsModalVisible(true);
  };

  const handleTermsAccept = () => {
    setTermsModalVisible(false);
    processRegistration();
  };

  const processRegistration = () => {
    console.log('Processando cadastro...', {
      name,
      email,
      phone,
      cancerType,
      birthDate,
      password
    });

    router.push('/');
  };

  const handleTermsDismiss = () => {
    setTermsModalVisible(false);
  };

  return (
    <PaperProvider theme={AppTheme}>
      <SafeAreaView style={[styles.container, { backgroundColor: AppTheme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={AppTheme.colors.primary} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <LoginSignupBackground>
            <View style={styles.contentWrapper}>

              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/logoCandiAlt.png')}
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
                  onChangeText={setCancerType}
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
                title="Cadastrar"
                onPress={handleRegisterClick}
                variant="primary"
              />

            </View>
          </LoginSignupBackground>
        </ScrollView>

        <TermsModal
          visible={termsModalVisible}
          onDismiss={handleTermsDismiss}
          onAccept={handleTermsAccept}
        />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  contentWrapper: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: 20, paddingTop: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
  logo: { width: 120, height: 120, resizeMode: 'contain' },
  welcomeContainer: { marginBottom: 20 },
  welcomeTitle: {
    fontFamily: AppTheme.fonts.headlineMedium.fontFamily,
    fontSize: AppTheme.fonts.displaySmall.fontSize,
  },
  formContainer: { marginBottom: 16 },
  backButton: { marginBottom: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});
