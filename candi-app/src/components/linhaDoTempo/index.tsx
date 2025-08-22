import * as React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { PaperProvider, TouchableRipple, TouchableRippleProps } from 'react-native-paper';

interface PropsBola { idB: boolean; }

interface PropsLinha { idL: boolean; }

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const MarcoBola = styled(View)<PropsBola>`
  height: 30px;
  width: 30px;
  background-color: ${props => props.idB == true ? '#FFC4C4' : '#9D9D9E'};
  border-radius: 15px;
  z-index: 2;
  position: relative;
`;

const MarcoLinha = styled(View)<PropsLinha>`
  height: 4px;
  width: 45px;
  background-color: ${props => props.idL == true ? '#FFC4C4' : '#9D9D9E'};
  z-index: 1;
  position: relative;
`;

export default function LinhaDoTempo() {
  return (
    <PaperProvider>
        <View style={{ padding: 20, gap: 30 }}>
        <Container>
            <MarcoBola idB={true}/>
            <MarcoLinha idL={true}/>
            <MarcoBola idB={true}/>
            <MarcoLinha idL={false}/>
            <MarcoBola idB={false}/>
            <MarcoLinha idL={false}/>
            <MarcoBola idB={false}/>
        </Container>
        </View>
    </PaperProvider>
  );
}