/**
 * Group Create Modal
 *
 * Modal for creating a new group with name and description
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, colors, typography, borderRadius } from '@/theme/tokens';
import Input from '@/components/Inputs/Input';
import Button from '@/components/Buttons/Button';

interface GroupCreateModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreateGroup: (name: string, description?: string) => Promise<void>;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ModalOverlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContainer = styled(View)`
  background-color: ${colors.neutral.white};
  border-top-left-radius: ${borderRadius.large}px;
  border-top-right-radius: ${borderRadius.large}px;
  padding-horizontal: ${spacing.base}px;
  padding-top: ${spacing.lg}px;
  padding-bottom: ${spacing.xxl}px;
  max-height: 80%;
`;

const ModalHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.lg}px;
  padding-bottom: ${spacing.base}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.neutral.light_gray};
`;

const ModalTitle = styled(Text)`
  font-size: ${typography.sizes.title_large}px;
  font-weight: ${typography.weights.bold};
  font-family: ${typography.fonts.heading};
  color: ${colors.text.primary};
`;

const CloseButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  justify-content: center;
  align-items: center;
`;

const FormSection = styled(View)`
  margin-bottom: ${spacing.lg}px;
`;

const ButtonGroup = styled(View)`
  gap: ${spacing.base}px;
  margin-top: ${spacing.lg}px;
`;

// ============================================================================
// COMPONENT
// ============================================================================

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  visible,
  onDismiss,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = groupName.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid) {
      Alert.alert('Erro', 'Nome do grupo é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      await onCreateGroup(groupName.trim(), description.trim() || undefined);
      // Reset form
      setGroupName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setGroupName('');
    setDescription('');
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleDismiss}
    >
      <ModalOverlay>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ModalContainer>
            {/* Header */}
            <ModalHeader>
              <ModalTitle>Criar Novo Grupo</ModalTitle>
              <CloseButton
                onPress={handleDismiss}
                disabled={isLoading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="close" size={24} color={colors.text.secondary} />
              </CloseButton>
            </ModalHeader>

            {/* Form */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* Group Name */}
              <FormSection>
                <Input
                  label="Nome do Grupo"
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Ex: Câncer de Mama"
                  editable={!isLoading}
                  maxLength={100}
                />
              </FormSection>

              {/* Description */}
              <FormSection>
                <Input
                  label="Descrição (opcional)"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descreva o propósito do grupo..."
                  multiline
                  editable={!isLoading}
                  maxLength={500}
                  style={{ minHeight: 100 }}
                />
              </FormSection>

              {/* Buttons */}
              <ButtonGroup>
                <Button
                  title="Criar Grupo"
                  onPress={handleCreate}
                  disabled={!isValid || isLoading}
                  loading={isLoading}
                  variant="primary"
                />
                <Button
                  title="Cancelar"
                  onPress={handleDismiss}
                  disabled={isLoading}
                  variant="outline"
                />
              </ButtonGroup>
            </ScrollView>
          </ModalContainer>
        </KeyboardAvoidingView>
      </ModalOverlay>
    </Modal>
  );
};

export default GroupCreateModal;
