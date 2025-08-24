import * as React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import { Modal, Portal, Button, PaperProvider } from 'react-native-paper';

interface PropsBola { idB: boolean; }

interface PropsLinha { idL: boolean; }

// ADICIONAR ESTILOS DA CAROLINDA E DA AMOR DPS

const Container = styled(TouchableOpacity)`
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

const ModalContentContainer = styled(View)`
  background-color: white;
  padding: 20px;
  margin: 40px;
  border-radius: 8px;
  margin-top: 60%;
  height: 200px; 
  width: 65%;  
  margin-left: 18%;
`;

export default function LinhaDoTempo() {
const [visible, setVisible] = React.useState(false);

const modalVisibility = () => {
  if (visible == false) setVisible(true);
  else setVisible(false);
};

  return (
    <PaperProvider>
        <View style={{ 
          padding: 20, 
          gap: 30,  
          alignItems: 'center',
          position: 'relative', }}>
        <Container onPress={modalVisibility}>
            <MarcoBola idB={true}/>
            <MarcoLinha idL={true}/>
            <MarcoBola idB={true}/>
            <MarcoLinha idL={false}/>
            <MarcoBola idB={false}/>
            <MarcoLinha idL={false}/>
            <MarcoBola idB={false}/>
        </Container>
        </View>
        <Portal>
          <Modal visible={visible}>
            <ModalContentContainer>
              <Text>Inserir como vamos mostrar os marcos</Text>
            </ModalContentContainer>
          </Modal>
      </Portal>
    </PaperProvider>
  );
}