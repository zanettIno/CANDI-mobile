import * as React from 'react';
import { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, StatusBar, Image, StyleSheet, Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import LoginSignupBackground from '../components/LoginSignupBackground';
import InputEmail from '../components/Inputs/inputEmail';
import InputPassword from '../components/Inputs/inputPassword';
import ButtonCustom from '../components/Buttons/buttonCustom';
import { useRouter } from 'expo-router';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  const router = useRouter();

  const handleLogin = () => {
    // Validações
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordIsValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

    setEmailValid(emailIsValid);
    setPasswordValid(passwordIsValid);

    if (!emailIsValid) {
      Alert.alert("Erro", "Por favor, insira um email válido.");
      return;
    }
    if (!passwordIsValid) {
      Alert.alert("Erro", "Senha inválida. Deve conter no mínimo 8 caracteres, incluindo letra maiúscula, número e caracter especial.");
      return;
    }

    router.push('/screens/(tabs)/home');
  };

  const handleSignUp = () => router.push('/cadastro');

  return (
    <PaperProvider theme={AppTheme}>
      <SafeAreaView style={[styles.container, { backgroundColor: AppTheme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={AppTheme.colors.primary} />
        <LoginSignupBackground>
          <View style={styles.contentWrapper}>

            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeTitle, { color: AppTheme.colors.textColor }]}>
                Bem vindo!
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: AppTheme.colors.tertinaryTextColor }]}>
                Entre com sua conta
              </Text>
            </View>

            <View style={styles.formContainer}>
              <InputEmail
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                style={{ borderColor: emailValid ? 'transparent' : '#ff6b6b', borderWidth: 1, borderRadius: 50 }}
              />
              <InputPassword
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                style={{ borderColor: passwordValid ? 'transparent' : '#ff6b6b', borderWidth: 1, borderRadius: 50 }}
              />
            </View>

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={[styles.forgotPasswordText, { color: AppTheme.colors.tertinaryTextColor }]}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
            </View>

            <ButtonCustom
              title="Entrar"
              onPress={handleLogin}
              variant="primary"
            />

            <View style={styles.signUpContainer}>
              <TouchableOpacity onPress={handleSignUp}>
                <Text>
                  Não possui uma conta? <Text style={[styles.signUpLink, { color: AppTheme.colors.primary }]}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </LoginSignupBackground>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: 20, paddingTop: 60 },
  welcomeContainer: { marginBottom: 40 },
  welcomeTitle: {
    fontFamily: AppTheme.fonts.headlineMedium.fontFamily,
    fontSize: AppTheme.fonts.displaySmall.fontSize,
  },
  welcomeSubtitle: {
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: AppTheme.fonts.titleLarge.fontSize,
  },
  formContainer: { marginBottom: 16 },
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 24 },
  forgotPasswordText: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
  },
  signUpContainer: { alignItems: 'center', marginTop: 16, flex: 1, justifyContent: 'flex-end', paddingBottom: 40 },
  signUpLink: {
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
  },
});
