import React, { useState } from 'react';
import { Modal, Portal, Text, IconButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index'; 
import SearchInput from '../Inputs/inputSearch';
import AddButton from '../Buttons/AddButton';

interface GroupAddProps {
  visible: boolean;
  onDismiss: () => void;
  onJoinGroup: (groupCode: string) => void; 
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

const GroupAdd: React.FC<GroupAddProps> = ({
  visible,
  onDismiss,
  onJoinGroup,
}) => {
  const [groupCode, setGroupCode] = useState('');

  const handleJoin = () => {
    onJoinGroup(groupCode);
    setGroupCode('');
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalOuter}>
        <ModalContainer>
          <CloseButton icon="close" size={24} onPress={onDismiss} />
          
          <ModalTitle>ENTRAR EM GRUPO</ModalTitle>
          <ModalText>
            Insira o nome do grupo para participar.
          </ModalText>
          
          <SearchInput
            value={groupCode}
            onChangeText={setGroupCode}
            style={styles.searchInput}
          />
          
          <AddButton
            text="Entrar no Grupo"
            onPress={handleJoin}
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

export default GroupAdd;
