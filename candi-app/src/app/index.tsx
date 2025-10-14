import * as React from 'react';
import { useState } from 'react';
import { Text, View, TouchableOpacity, StatusBar, Image, StyleSheet, Alert, Dimensions } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import LoginSignupBackground from '../components/LoginSignupBackground';
import InputEmail from '../components/Inputs/inputEmail';
import InputPassword from '../components/Inputs/inputPassword';
import ButtonCustom from '../components/Buttons/buttonCustom';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from 'constants/api'; 
import Clarity from '@microsoft/clarity';

const CLARITY_PROJECT_ID = "tlhkwdjvv6";

const { width } = Dimensions.get('window');

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== "undefined" && Clarity) {
      Clarity.init(CLARITY_PROJECT_ID);
      console.log('Microsoft Clarity inicializado na tela de Login.');

      // Exemplo: identificar o usuário após o login for bem-sucedido
      // if (userLoggedIn) {
      //   Clarity.identify(userId, sessionId, pageId, name); 
      // }
    }
  }, []);

  const handleLogin = async () => {
    const endpoint = `${API_BASE_URL}/auth/login`; 

    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        await AsyncStorage.setItem('accessToken', data.accessToken);
        
        if (typeof window !== "undefined" && Clarity) {
            const userId = data.userId || email; 

            Clarity.identify(userId, null, null, email); 
        }

        Alert.alert("Sucesso", "Login realizado!");
        router.push('/screens/(tabs)/home'); 
      } else {
        const errorMessage = data.message || "Email ou senha incorretos. Tente novamente.";
        Alert.alert("Erro de Login", errorMessage);
      }
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => router.push('/cadastro');

  return (
    <PaperProvider theme={AppTheme}>
      <View style={[styles.container, { backgroundColor: AppTheme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={AppTheme.colors.primary} />
        <LoginSignupBackground>
          <View style={styles.contentWrapper}>
            
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/rosa_clarinho.png')}
                style={styles.logo}
              />
            </View>
          
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
              />
              <InputPassword
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
              />
            </View>

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={() => router.push('/recuperarSenha')}>
                <Text style={[styles.forgotPasswordText, { color: AppTheme.colors.tertinaryTextColor }]}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
            </View>

            <ButtonCustom
              title={loading ? "Entrando..." : "Entrar"}
              onPress={handleLogin}
              variant="primary"
              disabled={loading}
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
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  signUpContainer: { 
    alignItems: 'center', 
    marginTop: 16, 
    flex: 1, 
    justifyContent: 'flex-end', 
    paddingBottom: '25%' 
  },
  signUpLink: {
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
  },
});