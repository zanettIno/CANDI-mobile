import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function HomeProfile() {
  return (
    <PaperProvider>
      <View>
        <Text>Tela Home do Profile</Text>
      </View>
    </PaperProvider>
  );
}