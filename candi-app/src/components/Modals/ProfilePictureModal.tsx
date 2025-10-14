import React from 'react';
import { Modal, Portal, Button, IconButton } from 'react-native-paper';
import { StyleSheet, View, Image, Alert, Platform } from 'react-native';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/api';

interface ProfilePictureModalProps {
  visible: boolean;
  onDismiss: () => void;
  user: {
    profile_id: string;
    profile_picture_last_updated?: number;
  };
  onPictureUpdate: (isDeletion: boolean) => void;
}

const ModalContainer = styled.View`
  background-color: white;
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  align-items: center;
  padding: 24px;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const ModalText = styled.Text`
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled(Image)`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  margin-bottom: 24px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  visible,
  onDismiss,
  user,
  onPictureUpdate,
}) => {
  const handleEditPicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    const formData = new FormData();

    if (Platform.OS === 'web') {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        formData.append('file', blob, `profile-picture.jpg`);
    } else {
        formData.append('file', {
            uri: image.uri,
            name: `profile-picture.jpg`,
            type: 'image/jpeg',
        } as any);
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error("Token não encontrado");

      const response = await fetch(`${API_BASE_URL}/profile-image/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao enviar a imagem.');
      }

      onPictureUpdate(false);
      Alert.alert('Sucesso!', 'Foto de perfil atualizada.');
      onDismiss();
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', 'Não foi possível atualizar sua foto.');
    }
  };

  const handleRemovePicture = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error("Token não encontrado");

      const response = await fetch(`${API_BASE_URL}/profile-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao remover a imagem.');
      }

      onPictureUpdate(true);
      Alert.alert('Sucesso!', 'Foto de perfil removida.');
    } catch (error) {
      console.error('Erro ao remover a imagem:', error);
      Alert.alert('Erro', 'Não foi possível remover sua foto.');
    }
  };

  const getModalAvatarSource = () => {
      if (user.profile_picture_last_updated) {
          const uri = `https://candi-image-uploads.s3.us-east-1.amazonaws.com/profile-images/${user.profile_id}.jpg?timestamp=${user.profile_picture_last_updated}`;
          return { uri };
      }
      return require('../../../assets/default-avatar.jpg');
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalOuter}>
        <ModalContainer>
          <CloseButton icon="close" size={24} onPress={onDismiss} />
          <ModalTitle>FOTO DE PERFIL</ModalTitle>
          <ModalText>Sua foto de perfil poderá ser visível para os outros usuários da comunidade</ModalText>
          <ProfileImage
            key={user.profile_picture_last_updated || 'default-avatar'}
            source={getModalAvatarSource()}
          />
          <Button mode="contained" onPress={handleEditPicture} style={styles.button}>
            Editar foto de Perfil
          </Button>
          <Button mode="outlined" onPress={handleRemovePicture} style={[styles.button, styles.removeButton]}>
            Remover foto de Perfil
          </Button>
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
    button: {
        width: '100%',
        borderRadius: 8,
        marginBottom: 10,
    },
    removeButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
});

export default ProfilePictureModal;