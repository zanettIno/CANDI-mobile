import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BackIconButton() {
    const { width, height } = useWindowDimensions();
  return (
    <PaperProvider>
        <TouchableOpacity onPress={() => { router.back(); }}>
            <MaterialIcons name="chevron-left" size={200} color="#545f71" />
        </TouchableOpacity>
    </PaperProvider>
  );
}