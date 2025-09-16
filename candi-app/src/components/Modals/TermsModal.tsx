import React, { useState } from 'react';
import { Modal, Portal, Button, Text, IconButton, Checkbox } from 'react-native-paper';
import { ScrollView, StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme/index';
import PrivacyModal from '../Modals/PrivacyModal';

interface TermsModalProps {
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

const TermsModal: React.FC<TermsModalProps> = ({ visible, onDismiss, onAccept }) => {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const handleContinue = () => {
  if (isTermsAccepted) {
    onDismiss(); 
    setPrivacyModalVisible(true);
  }
};

  const handlePrivacyAccept = () => {
    setPrivacyModalVisible(false);
    onAccept();
  };

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.modalOuter}
        >
          <ModalContainer>
            <ModalHeader>
              <Text style={styles.title}>Termos de uso</Text>
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
                  Os termos de uso do aplicativo Candi descrevem as condições de uso do serviço,
                  responsabilidades do usuário, tratamento de dados e limitações de responsabilidade.
                  Leia atentamente antes de prosseguir. {'\n\n'}
                  1. Uso: O aplicativo destina-se a apoiar pacientes oncológicos com informações e
                  gerenciamento de tarefas relacionadas ao tratamento. {'\n\n'}
                  2. Responsabilidades: O usuário se compromete a fornecer informações verdadeiras e
                  a não compartilhar credenciais. {'\n\n'}
                  3. Dados: As informações pessoais coletadas serão tratadas conforme a nossa política
                  de privacidade (verifique a política completa). {'\n\n'}
                  4. Limitações: O app não substitui aconselhamento médico profissional. {'\n\n'}
                  (Texto de exemplo — substitua pelo texto oficial dos termos de uso.)
                </Text>
              </ScrollView>
            </ModalContent>

            <ModalFooter>
              <CheckboxRow>
                <Checkbox
                  status={isTermsAccepted ? 'checked' : 'unchecked'}
                  onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                  color={AppTheme.colors.tertiary}
                />
                <CheckboxText>
                  Li e concordo com os termos de uso ao me cadastrar
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
                  onPress={handleContinue}
                  disabled={!isTermsAccepted}
                  style={[
                    styles.button,
                    styles.acceptButton,
                    !isTermsAccepted && styles.disabledButton
                  ]}
                  labelStyle={styles.acceptButtonText}
                >
                  Continuar
                </Button>
              </ButtonContainer>
            </ModalFooter>
          </ModalContainer>
        </Modal>
      </Portal>

      <PrivacyModal
        visible={privacyModalVisible}
        onDismiss={() => setPrivacyModalVisible(false)}
        onAccept={handlePrivacyAccept}
      />
    </>
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
    maxHeight: 260, // garante espaço para o texto e torna rolável quando necessário
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

export default TermsModal;
