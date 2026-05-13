import { Stack, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';
import * as Inter from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { pt, registerTranslation } from "react-native-paper-dates";
import { ProfileProvider } from '@/context/ProfileContext';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationDisplay from '@/components/NotificationDisplay';

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

  if (!fontsLoaded && !fontError) return null;

  registerTranslation("pt", pt);

  return (
    <PaperProvider theme={AppTheme}>
      <NotificationProvider>
        <ProfileProvider>
          <NotificationDisplay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="cadastro" />
            <Stack.Screen name="screens/community/chatCommunity" />
            <Stack.Screen name="screens/community/groupCommunity" />
            <Stack.Screen name="screens/community/postDetail" />
          </Stack>
        </ProfileProvider>
      </NotificationProvider>
    </PaperProvider>
  );
}