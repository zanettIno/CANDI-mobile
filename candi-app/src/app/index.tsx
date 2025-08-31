import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PaperProvider, Button } from 'react-native-paper';
import { AppTheme } from '../theme';
import { router } from "expo-router";
import * as Kadwa from '@expo-google-fonts/kadwa';
import CommunityShortcut from '@/components/Community-Shortcut';

export default function Index() {
  return (
    <PaperProvider theme={AppTheme}>
      <View>
      <TouchableOpacity onPress={()=>{
          router.push("/screens/home")
        }}>
        <Text style={{ color: AppTheme.colors.textColor, fontSize: 20, margin: 20,  fontFamily: AppTheme.fonts.bodyMedium.fontFamily}} >
            Oioi Candi!! CHZ
        </Text>
      </TouchableOpacity>
      </View>
      <CommunityShortcut/>
    </PaperProvider>
  );
}