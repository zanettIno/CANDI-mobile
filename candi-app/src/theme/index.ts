import { DefaultTheme, configureFonts } from 'react-native-paper';
import { MD3LightTheme } from 'react-native-paper';

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      tertiary: string;
      quaternary: string;
      cardBackground: string;
      placeholderBackground: string;
      placeholderText: string;
      nameText: string;
      roleText: string;
      phoneText: string;
      shadow: string;
    }
  }
}

const fontConfig = {
  bodySmall:     { fontFamily: 'Inter_400Regular', fontSize: 12, fontWeight: '400' as const },
  bodyMedium:    { fontFamily: 'Inter_400Regular', fontSize: 14, fontWeight: '400' as const },
  bodyLarge:     { fontFamily: 'Inter_500Medium',  fontSize: 16, fontWeight: '500' as const },
  labelSmall:    { fontFamily: 'Inter_400Regular', fontSize: 11, fontWeight: '400' as const },
  labelMedium:   { fontFamily: 'Inter_500Medium',  fontSize: 12, fontWeight: '500' as const },
  labelLarge:    { fontFamily: 'Inter_500Medium',  fontSize: 14, fontWeight: '500' as const },
  
  titleSmall:    { fontFamily: 'Kadwa_700Bold', fontSize: 14, fontWeight: '700' as const },
  titleMedium:   { fontFamily: 'Kadwa_700Bold', fontSize: 16, fontWeight: '700' as const },
  titleLarge:    { fontFamily: 'Kadwa_700Bold', fontSize: 22, fontWeight: '700' as const },

  headlineSmall: { fontFamily: 'Kadwa_700Bold', fontSize: 24, fontWeight: '700' as const },
  headlineMedium:{ fontFamily: 'Kadwa_700Bold', fontSize: 28, fontWeight: '700' as const },
  headlineLarge: { fontFamily: 'Kadwa_700Bold', fontSize: 32, fontWeight: '700' as const },

  displaySmall:  { fontFamily: 'Kadwa_400Regular', fontSize: 36, fontWeight: '400' as const },
  displayMedium: { fontFamily: 'Kadwa_400Regular', fontSize: 45, fontWeight: '400' as const },
  displayLarge:  { fontFamily: 'Kadwa_400Regular', fontSize: 57, fontWeight: '400' as const },
};
export const AppTheme = {
  ...MD3LightTheme, 
  roundness: 50, 
  colors: {
    ...MD3LightTheme.colors, 
    
    primary: '#FFC4C4',      
    secondary: '#CFFFE5',   
    tertiary: '#759AAB', 
    tertiaryLight: '#8cb2c4ff',
    tertinaryTextColor: '#545F71',
    background: '#f6f6f6',      
    cardBackground: '#FFFFFF',
    placeholderBackground: '#EAEAEA',
    placeholderText: '#888',
    nameText: '#333',
    roleText: '#666',
    phoneText: '#555',
    shadow: '#000',
    textColor: '#413F42',
    dotsColor: '#CCCCCC',
    formFieldColor: '#eeeeeeff' 
  },

  fonts: configureFonts({ config: fontConfig }),
};