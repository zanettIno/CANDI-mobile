import * as React from 'react';
import { useState } from 'react';
import { Text, View, SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import LoginSignupBackground from '../components/LoginSignupBackground';
import InputEmail from '../components/Inputs/inputEmail';
import InputPassword from '../components/Inputs/inputPassword';
import InputConfirmPassword from '../components/Inputs/inputConfirmPassword';
import InputPhone from '../components/Inputs/inputPhone';
import InputBirth from '../components/Inputs/inputBirth';
import InputTypeCancer from '../components/Inputs/inputTypeCancer';
import ButtonCustom from '../components/Buttons/buttonCustom';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import InputName from '@/components/Inputs/inputName';

export default function Cadastro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();

  const handleBack = () => router.back();
  const handleRegister = () => router.push('/'); 
  

  const handleBirthDateChange = (date: Date | null, text: string) => {
    setBirthDate(text);
  };

  return (
    <PaperProvider theme={AppTheme}>
      <SafeAreaView style={[styles.container, { backgroundColor: AppTheme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={AppTheme.colors.primary} />
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
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
                />

                <InputEmail
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                />

                <InputPhone
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Telefone"
                />

                <InputTypeCancer
                  value={cancerType}
                  onChangeText={setCancerType}
                  placeholder="Tipo do câncer"
                />

                <InputBirth
                  value={birthDate}
                  onChangeText={handleBirthDateChange}
                  placeholder="Data de nascimento"
                />

                <InputPassword
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Senha"
                />

                <InputConfirmPassword
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmar senha"
                  originalPassword={password}
                />
              </View>

              <ButtonCustom
                title="Cadastrar"
                onPress={handleRegister}
                variant="primary"
              />

            </View>
          </LoginSignupBackground>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    paddingHorizontal: 20, 
    paddingTop: 20, 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40, 
    marginTop: 10, 
  },
  logo: { 
    width: 120, 
    height: 120, 
    resizeMode: 'contain' 
  },
  welcomeContainer: { 
    marginBottom: 20 
  },
  welcomeTitle: {
    fontFamily: AppTheme.fonts.headlineMedium.fontFamily,
    fontSize: AppTheme.fonts.displaySmall.fontSize,
  },
  formContainer: { 
    marginBottom: 16 
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
