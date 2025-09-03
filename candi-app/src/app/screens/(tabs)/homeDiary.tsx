import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function HomeDiary() {
  return (
    <PaperProvider>
      <View>
        <Text>Tela Home do Diario</Text>
      </View>
    </PaperProvider>
  );
}