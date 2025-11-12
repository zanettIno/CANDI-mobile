import React, { useState } from 'react';
import { Modal, Portal, Text, IconButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index'; 
import SearchInput from '../Inputs/inputSearch';
import AddButton from '../Buttons/AddButton';


interface MessagesAddProps {
  visible: boolean;
  onDismiss: () => void;
  onAddConversation: (searchText: string) => void; 
}

const ModalContainer = styled.View`
  background-color: ${AppTheme.colors.cardBackground};
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  padding: 24px;
  align-items: center;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${AppTheme.colors.textColor};
  font-family: 'Kadwa_700Bold'; 
`;

const ModalText = styled(Text)`
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  color: ${AppTheme.colors.textColor};
  font-family: 'Inter_400Regular'; 
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const MessagesAdd: React.FC<MessagesAddProps> = ({
  visible,
  onDismiss,
  onAddConversation,
}) => {
  const [searchText, setSearchText] = useState('');

  const handleAdd = () => {
    onAddConversation(searchText);
    setSearchText('');
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalOuter}>
        <ModalContainer>
          <CloseButton icon="close" size={24} onPress={onDismiss} />
          
          <ModalTitle>NOVA CONVERSA</ModalTitle>
          <ModalText>
            Pesquise por um usuário para iniciar uma nova conversa privada.
          </ModalText>
          
          <SearchInput
            placeholder="E-mail do usuário"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
          
          <AddButton
            text="Iniciar Conversa"
            onPress={handleAdd}
            style={styles.addButton}
          />
          
        </ModalContainer>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
    modalOuter: {
        flex: 1,
        justifyContent: 'center',
    },
    searchInput: {
        width: '100%',
        marginBottom: 20,
    },
    addButton: {
        width: '100%',
        maxWidth: 300, 
    },
});

export default MessagesAdd;
