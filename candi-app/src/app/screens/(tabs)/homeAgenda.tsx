import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import CandiLogo from '@/components/WhiteCandiLogo';
import CCalendar from '@/components/Calendar';
import BottomSheet from '@/components/AgendaDetails';
import styled from 'styled-components/native';
import ButtonCustom from '../../../components/Buttons/buttonCustom';
import { AppTheme } from '../../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const Container = styled(View)`
    flex: 1;
    background-color: ${AppTheme.colors.primary};
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
`;

const ContainerButtons = styled(View)`
    position: absolute;
    top: 62%;
`;

export default function HomeAgenda() {
  return (
    <PaperProvider>
    <Container>
      <TouchableOpacity onPress={() => {
        router.navigate('/screens/agenda/relatorio');
      }}>
        <MaterialIcons name="library-books" size={40} color={AppTheme.colors.background} style={{
          top: 55,
          zIndex: 2,
          left: 160
        }}/>
      </TouchableOpacity>
      <CandiLogo bottom={'30%'} left={null} version={require('../../../../assets/images/rosa_clarinho.png')}/>
      
      <CCalendar/>
        <ContainerButtons>
          <ButtonCustom
              title="Registrar compromisso"
              onPress={() => router.push('/screens/agenda/compromissosView')}
              variant="primary"/>
            <ButtonCustom
              title="Sintomas"
              onPress={() => router.push('/screens/agenda/sintomasView')}
              variant="secondary"/>
        </ContainerButtons>
          <BottomSheet/>
    </Container>
    </PaperProvider>
  );
}