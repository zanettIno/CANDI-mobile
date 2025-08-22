import * as React from 'react';
import { View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import LinhaDoTempo from '../components/linhaDoTempo';

export default function Index() {
  return (
    <PaperProvider>
      <View>
        <Text>
            Oioi Candi!! CHZ
        </Text>
        <LinhaDoTempo/>
      </View>
    </PaperProvider>
  );
}