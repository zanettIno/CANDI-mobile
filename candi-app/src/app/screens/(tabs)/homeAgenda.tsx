import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function HomeAgenda() {
  return (
    <PaperProvider>
      <View>
        <Text>Tela Home da Agenda</Text>
      </View>
    </PaperProvider>
  );
}