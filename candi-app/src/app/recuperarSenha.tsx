import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppTheme } from '@/theme';
import HomeBackground from '@/components/HomeBackground';
import { SendButton } from '@/components/Buttons/sendButton';

const { height } = Dimensions.get('window');

interface InputEmailProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

const InputEmailContainer = styled(View)`
  position: relative;
  margin-bottom: 16px;
  margin: 16px 0;
`;

const StyledTextInput = styled.TextInput<{ isValid?: boolean }>`
  background-color: ${AppTheme.colors.formFieldColor};
  border-radius: 50px;
  padding: 16px;
  font-size: 20px;
  color: #545f71;
  border: 1px solid ${(props) => (props.isValid === false ? '#ff6b6b' : 'transparent')};
`;

const InputEmail: React.FC<InputEmailProps> = ({
  value,
  onChangeText,
  placeholder = 'Email',
  style,
}) => {
  const isValidEmail = (email: string) => /^[^\s@]+@[\s@]+\.[^\s@]+$/.test(email);

  return (
    <InputEmailContainer style={style}>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        isValid={value ? isValidEmail(value) : undefined}
      />
    </InputEmailContainer>
  );
};

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

const SignUpContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  margin-top: 24px;
`;

const SignUpText = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.tertinaryTextColor};
`;

const SignUpLink = styled(TouchableOpacity)`
  margin-left: 4px;
`;

const SignUpLinkText = styled(Text)`
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.primary};
`;

const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecoverPassword = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Link de recuperação enviado para ' + email);
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
          <Title>Esqueceu sua senha?</Title>
          <Description>
            Para ajudar você a recuperar o acesso, precisamos que informe o e-mail utilizado no
            cadastro. Enviaremos um link para redefinir sua senha e, assim, você poderá acessar
            novamente sua conta.
          </Description>

          <InputEmail
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            style={{ marginHorizontal: 0 }}
          />

          <SendButton
            onPress={handleRecoverPassword}
            loading={loading}
            disabled={!email || !/^[^\s@]+@[\s@]+\.[^\s@]+$/.test(email)}
          />

          <SignUpContainer>
            <SignUpText>Não possui uma conta?</SignUpText>
            <SignUpLink onPress={() => router.push('/cadastro')}>
              <SignUpLinkText>Cadastrar-se</SignUpLinkText>
            </SignUpLink>
          </SignUpContainer>
        </ContentWrapper>
      </SafeAreaView>
    </HomeBackground>
  );
};

export default RecuperarSenha;
