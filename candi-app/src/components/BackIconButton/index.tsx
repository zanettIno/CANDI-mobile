import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BackIconButton({color, bottom, left}) {
    const { width, height } = useWindowDimensions();
  return (
    <PaperProvider>
      <View>
        <TouchableOpacity onPress={() => { router.back(); }}>
            <MaterialIcons name="chevron-left" size={50} color={color} style={{
              left: left,
              bottom: bottom
            }}/>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}