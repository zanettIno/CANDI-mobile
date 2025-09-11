import * as React from 'react';
import { View, Text, Image } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import WhiteCandiLogo from '@/components/WhiteCandiLogo';
import CCalendar from '@/components/Calendar';
import BottomSheet from '@/components/AgendaDetails';
import styled from 'styled-components/native';
import ButtonCustom from '../../../components/Buttons/buttonCustom';
import { AppTheme } from '../../../theme';

const Container = styled(View)`
    flex: 1;
    background-color: ${AppTheme.colors.primary};
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
`;

const ContainerButtons = styled(View)`
    position: absolute;
    top: 58%;
`;

export default function HomeAgenda() {
  return (
    <PaperProvider>
    <Container>
      <WhiteCandiLogo bottom={'20%'}/>
      <CCalendar/>
        <ContainerButtons>
          <ButtonCustom
              title="Registrar compromisso"
              onPress={() => { console.log("foi") }}
              variant="primary"/>
            <ButtonCustom
              title="Sintomas"
              onPress={() => { console.log("foi") }}
              variant="tertiary"/>
        </ContainerButtons>
          <BottomSheet/>
    </Container>
    </PaperProvider>
  );
}