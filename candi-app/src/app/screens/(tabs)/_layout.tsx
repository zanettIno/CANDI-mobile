import { SplashScreen, Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';
import * as Inter from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { pt, registerTranslation } from "react-native-paper-dates";
import { Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useChat } from '@/context/ChatContext';
import { useProfile } from '@/context/ProfileContext';

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
  const { totalUnread } = useChat();
  const { role } = useProfile();

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
            tabBarBadge: totalUnread > 0 ? (totalUnread > 99 ? '99+' : totalUnread) : undefined,
            tabBarBadgeStyle: styles.badge,
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
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="event" size={TAB_ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={TAB_ICON_SIZE + 2} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="homeDiary"
          options={{
            title: 'Diário',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="book" size={TAB_ICON_SIZE} color={color} />
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
        {/* Aba Admin — visível apenas para role=admin via href externo */}
        {role === 'admin' && (
          <Tabs.Screen
            name="adminDummy"
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                navigation.navigate('screens/admin/index');
              },
            })}
            options={{
              title: 'Admin',
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="shield" size={TAB_ICON_SIZE} color={color} />
              ),
              tabBarActiveTintColor: '#ef4444',
            }}
          />
        )}
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
  badge: {
    backgroundColor: '#ef4444',
    fontSize: 10,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    lineHeight: 18,
  },
});
