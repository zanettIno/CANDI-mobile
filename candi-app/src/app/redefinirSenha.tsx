import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppTheme } from '@/theme';
import HomeBackground from '@/components/HomeBackground';
import InputNewPassword from '@/components/Inputs/inputNewPassword';
import InputConfirmNewPassword from '@/components/Inputs/inputConfirmNewPassword';
import { SendButton } from '@/components/Buttons/sendButton';

const { width, height } = Dimensions.get('window');

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  position: absolute;
  top: ${StatusBar.currentHeight || 0}px;
  left: 0;
  right: 0;
  z-index: 10;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const HeaderTitle = styled(Text)`
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyLarge.fontWeight};
  color: ${AppTheme.colors.tertinaryTextColor};
  margin-left: 16px;
`;

const ContentWrapper = styled(View)`
  flex: 1;
  padding: 24px;
  padding-top: ${height * 0.25 + 24}px; 
  background-color: transparent;
`;

const Title = styled(Text)`
  font-family: ${AppTheme.fonts.headlineSmall.fontFamily};
  font-size: ${AppTheme.fonts.headlineSmall.fontSize}px;
  font-weight: ${AppTheme.fonts.headlineSmall.fontWeight};
  color: ${AppTheme.colors.tertinaryTextColor};
  margin-bottom: 8px;
`;

const Description = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.tertinaryTextColor};
  margin-bottom: 32px;
  line-height: 22px;
`;

const NewPasswordScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // VALIDAÇÃO: no mínimo 8 caracteres, letra maiúscula, número e caracter especial
  const isValidPassword = (password: string) => 
    /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
  const isFormValid = isValidPassword(newPassword) && passwordsMatch;

  const handleSetNewPassword = () => {
    setLoading(true);
    console.log('Nova senha:', newPassword);
    setTimeout(() => {
      setLoading(false);
      alert('Senha alterada com sucesso!');
    }, 2000);
  };

  return (
    <HomeBackground>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Header>
          <BackButton onPress={() => router.back()}>
            <MaterialIcons 
              name="arrow-back-ios" 
              size={24} 
              color={AppTheme.colors.tertinaryTextColor} 
            />
          </BackButton>
        </Header>

        <ContentWrapper>
          <Title>Nova senha</Title>
          <Description>
            Preencha os campos para criar uma nova senha
          </Description>

          <InputNewPassword
            value={newPassword}
            onChangeText={setNewPassword}
            style={{ marginHorizontal: 0 }}
          />

          <InputConfirmNewPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={{ marginHorizontal: 0 }}
          />

          <SendButton
            onPress={handleSetNewPassword}
            loading={loading}
            disabled={!isFormValid}
          />
        </ContentWrapper>
      </SafeAreaView>
    </HomeBackground>
  );
};

export default NewPasswordScreen;
