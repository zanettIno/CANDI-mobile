// src/app/_layout.tsx

import { Stack, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';
import * as Inter from '@expo-google-fonts/inter';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PaperProvider theme={AppTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="cadastro"/>
      </Stack>
    </PaperProvider>
  );
}