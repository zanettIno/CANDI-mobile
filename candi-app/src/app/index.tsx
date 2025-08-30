import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../theme';
import * as Kadwa from '@expo-google-fonts/kadwa';

export default function Index() {
  return (
    <PaperProvider theme={AppTheme}>
      <View>
        <Text style={{ color: AppTheme.colors.textColor, margin: 20,  fontFamily: AppTheme.fonts.bodyMedium.fontFamily}} >
            Oioi Candi!! CHZ
        </Text>
      </View>
    </PaperProvider>
  );
}