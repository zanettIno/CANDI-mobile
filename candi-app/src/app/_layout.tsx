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

// Cache da role para evitar chamada à API em cada navegação
const getCachedRole = async (): Promise<string> => {
  // Tenta ler role cacheada (salva no login)
  const cached = await AsyncStorage.getItem('userRole');
  if (cached) return cached;
  // Fallback: busca da API (só na primeira vez ou após limpar cache)
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return 'patient';
    const { default: API } = await import('../constants/api');
    const res = await fetch(`${(API as any).API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return 'patient';
    const profile = await res.json();
    const role = profile.role || 'patient';
    await AsyncStorage.setItem('userRole', role);
    return role;
  } catch { return 'patient'; }
};

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const inProtectedArea = segments[0] === 'screens';
        const inAdminArea = segments.includes('admin');
        const inTabsArea = segments.includes('(tabs)');

        // Sem token — manda pro login e limpa cache de role
        if (!token && inProtectedArea) {
          await AsyncStorage.removeItem('userRole');
          router.replace('/');
          return;
        }
        if (!token) return;

        // Role vem do cache (rápido) ou da API (só na primeira vez)
        const role = await getCachedRole();

        if (role === 'admin' && inTabsArea) {
          router.replace('/screens/admin');
        } else if (role !== 'admin' && inAdminArea) {
          router.replace('/screens/(tabs)/home');
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
                <Stack.Screen name="screens/admin" />
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

