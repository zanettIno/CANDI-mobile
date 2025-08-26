import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';
import LoginSignupBackground from '@/components/LoginSignupBackground';

export default function Index() {
  return (
    <PaperProvider theme={AppTheme}>
      <LoginSignupBackground>
        <Text style={{ color: AppTheme.colors.textColor, fontSize: 20, margin: 20,  fontFamily: AppTheme.fonts.bodyMedium.fontFamily}} >
            Oioi Candi!! CHZ
        </Text>
      </LoginSignupBackground>
    </PaperProvider>
  );
}

