  import * as React from 'react';
  import { HomeBackground } from '../../../components/HomeProfile/HomeBackground';
  import { ContentContainer } from '../../../components/HomeProfile/ContentContainer';
  import { ProfileCard } from '../../../components/HomeProfile/CardProfileContats';
  import { LabelsRow } from '../../../components/HomeProfile/LabelsRow';
  import { Separator } from '../../../components/HomeProfile/Separator';
  import { AdvancedSettings } from '../../../components/HomeProfile/AdvancedSettings';
import { AdvancedLinks } from '@/components/HomeProfile/AdvancedLinks';
import { ContatsBackground } from '@/components/HomeProfile/ContatsBackground';
import { router } from 'expo-router';
import { Text } from 'react-native'

export default function ContatosView() {
  return (
   
 <ContatsBackground
  onBackPress={() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("../homeProfile");
    }
  }}
>

  <ContentContainer>
  <Text>Configurações</Text>
  </ContentContainer>
</ContatsBackground>
     );
   }