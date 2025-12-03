import { Stack, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
// 🔹 CORREÇÃO: Ajuste do caminho relativo para encontrar o tema na raiz do src
import { AppTheme } from '../../../theme'; 
import * as Kadwa from '@expo-google-fonts/kadwa';
import * as Inter from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { pt, registerTranslation } from "react-native-paper-dates";
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

registerTranslation("pt", pt);

export default function RootLayout() {
  const [fontsLoaded, fontError] = Kadwa.useFonts({
    ...Kadwa,
    ...Inter,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        input:focus, textarea:focus, div[contenteditable="true"]:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PaperProvider theme={AppTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="cadastro"/>
        <Stack.Screen name="screens/community/chatCommunity" />
      </Stack>
    </PaperProvider>
  );
}