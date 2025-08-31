import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function Home() {
  return (
    <PaperProvider>
      <View>
        <Text>Tela Home do App</Text>
      </View>
    </PaperProvider>
  );
}