import { SplashScreen, Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';
import * as Inter from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { pt, registerTranslation } from "react-native-paper-dates";
import { Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

registerTranslation("pt", pt);

SplashScreen.preventAutoHideAsync();

const TAB_ICON_SIZE = 26;
const ACTIVE_COLOR = AppTheme.colors.tertiary;
const INACTIVE_COLOR = '#CED5D7';

export default function RootLayout() {
  const [fontsLoaded, fontError] = Kadwa.useFonts({
    ...Kadwa,
    ...Inter,
  });

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
      return () => { document.head.removeChild(style); };
    }
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <PaperProvider theme={AppTheme}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tabs.Screen
          name="homeCommunity"
          options={{
            title: 'Comunidade',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons
                name={focused ? 'people' : 'people-outline'}
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
            tabBarStyle: styles.tabBar,
          }}
        />
        <Tabs.Screen
          name="homeAgenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons
                name={focused ? 'event' : 'event'}
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons
                name={focused ? 'home' : 'home'}
                size={TAB_ICON_SIZE + 2}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="homeDiary"
          options={{
            title: 'Diário',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons
                name={focused ? 'book' : 'book'}
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="homeProfile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons
                name={focused ? 'person' : 'person-outline'}
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 4,
  },
});