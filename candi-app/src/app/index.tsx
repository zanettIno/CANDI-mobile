import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function Main() {
  return (
    <PaperProvider>
      <View>
        <Text>
            Oioi Candi!! CHZ
        </Text>
      </View>
    </PaperProvider>
  );
}