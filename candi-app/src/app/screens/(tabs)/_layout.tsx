// src/app/_layout.tsx

import { Stack, SplashScreen, Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';
import * as Inter from '@expo-google-fonts/inter';
import { useEffect } from 'react';

import { MaterialIcons } from "@expo/vector-icons";

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
      <Tabs screenOptions={{ tabBarActiveTintColor: '#FFC4C4', tabBarInactiveTintColor: '#CED5D7', headerShown: false }}>
      <Tabs.Screen
        name="homeCommunity"
        options={{
          title: 'Comunidade',
          //tabBarLabel:() => {return null},
          tabBarIcon: ({ color }) => <MaterialIcons name="people" size={30} color={color} />,
          tabBarStyle: { display: 'none' },
        }}
        
      />
        <Tabs.Screen
        name="homeAgenda"
        options={{
          title: 'Agenda',
          
          tabBarIcon: ({ color }) => <MaterialIcons name="bookmark" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={30} color={color} />,
        }}
      />
    <Tabs.Screen
        name="homeDiary"
        options={{
          title: 'Diario',
          
          tabBarIcon: ({ color }) => <MaterialIcons name="edit" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="homeProfile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={30} color={color} />,
        }}
      />
    </Tabs>

    </PaperProvider>
  );
}