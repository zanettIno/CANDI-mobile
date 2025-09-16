import React, { useState } from 'react';
import { Modal, Portal, Button, Text, IconButton, Checkbox } from 'react-native-paper';
import { ScrollView, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index';

interface PrivacyModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAccept: () => void;
}

const ModalContainer = styled.View`
  background-color: white;
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  max-height: 80%;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px 20px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const ModalContent = styled.View`
  padding: 0px 20px 10px 20px;
`;

const ModalFooter = styled.View`
  padding: 10px 20px 20px 20px;
  border-top-width: 1px;
  border-top-color: #f0f0f0;
`;

const CheckboxRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const CheckboxText = styled.Text`
  margin-left: 8px;
  flex: 1;
  font-family: 'Inter_400Regular';
  font-size: 14px;
  color: ${AppTheme.colors.textColor};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const PrivacyModal: React.FC<PrivacyModalProps> = ({ visible, onDismiss, onAccept }) => {
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalOuter}
      >
        <ModalContainer>
          <ModalHeader>
            <Text style={styles.title}>Políticas de privacidade</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              iconColor={AppTheme.colors.textColor}
            />
          </ModalHeader>

          <ModalContent>
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.contentText}>
                A política de privacidade do Candi descreve como coletamos, usamos e protegemos
                seus dados pessoais. Coletamos informações básicas necessárias para criar e
                gerenciar sua conta, melhorar a experiência no app e, quando aplicável, para
                oferecer funcionalidades personalizadas. Não vendemos seus dados a terceiros
                e tomamos medidas para proteger sua privacidade conforme as leis aplicáveis.
                {'\n\n'}
                (Texto de exemplo — substitua pelo texto oficial da política de privacidade.)
              </Text>
            </ScrollView>
          </ModalContent>

          <ModalFooter>
            <CheckboxRow>
              <Checkbox
                status={isPrivacyAccepted ? 'checked' : 'unchecked'}
                onPress={() => setIsPrivacyAccepted(!isPrivacyAccepted)}
                color={AppTheme.colors.tertiary}
              />
              <CheckboxText>
                Li e concordo com a política de privacidade ao me cadastrar
              </CheckboxText>
            </CheckboxRow>

            <ButtonContainer>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={[styles.button, styles.cancelButton]}
                labelStyle={styles.cancelButtonText}
              >
                Negar
              </Button>
              <Button
                mode="contained"
                onPress={onAccept}
                disabled={!isPrivacyAccepted}
                style={[
                  styles.button,
                  styles.acceptButton,
                  !isPrivacyAccepted && styles.disabledButton
                ]}
                labelStyle={styles.acceptButtonText}
              >
                Aceitar
              </Button>
            </ButtonContainer>
          </ModalFooter>
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
  title: {
    fontFamily: 'Kadwa_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.colors.textColor,
  },
  scrollArea: {
    maxHeight: 260,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  contentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: AppTheme.colors.textColor,
    textAlign: 'justify',
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: AppTheme.colors.tertiary,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: AppTheme.colors.tertiary,
    fontFamily: 'Inter_500Medium',
  },
  acceptButton: {
    backgroundColor: AppTheme.colors.tertiary,
  },
  acceptButtonText: {
    color: 'white',
    fontFamily: 'Inter_500Medium',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default PrivacyModal;
