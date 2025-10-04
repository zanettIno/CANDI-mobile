import { Linking, Alert, Platform } from 'react-native';

export const makePhoneCall = async (phoneNumber: string) => {
  if (!phoneNumber) {
    Alert.alert('Erro', 'Número de telefone não fornecido.');
    return;
  }

  const url = `${Platform.OS === 'ios' ? 'telprompt:' : 'tel:'}${phoneNumber}`;

  try {
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Erro',
        'Não foi possível realizar a chamada. Verifique se o seu dispositivo pode fazer ligações.'
      );
    }
  } catch (error) {
    console.error('Falha ao tentar realizar a chamada:', error);
    Alert.alert('Erro', 'Ocorreu um erro inesperado ao tentar fazer a ligação.');
  }
};