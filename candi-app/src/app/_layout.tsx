import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';
import * as Inter from '@expo-google-fonts/inter';
import { useEffect, useState } from 'react';
import { pt, registerTranslation } from "react-native-paper-dates";
import { ProfileProvider } from '@/context/ProfileContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ChatProvider } from '@/context/ChatContext';
import NotificationDisplay from '@/components/NotificationDisplay';
import GlobalSocketController from '@/components/GlobalSocketController';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const inProtectedArea = segments[0] === 'screens';
        if (!token && inProtectedArea) {
          router.replace('/');
        }
      } finally {
        setChecked(true);
      }
    };
    check();
  }, [segments]);

  if (!checked) return null;
  return <>{children}</>;
}

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
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={AppTheme}>
        <NotificationProvider>
          <ChatProvider>
            <ProfileProvider>
              <AuthGate>
                <NotificationDisplay />
              <GlobalSocketController />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="cadastro" />
                <Stack.Screen name="cadastroSupport" />
                <Stack.Screen name="screens/community/chatCommunity" />
                <Stack.Screen name="screens/community/groupCommunity" />
                <Stack.Screen name="screens/community/postDetail" />
                <Stack.Screen name="screens/admin/index" />
                <Stack.Screen name="screens/profile/invite" />
              </Stack>
              </AuthGate>
            </ProfileProvider>
          </ChatProvider>
        </NotificationProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
