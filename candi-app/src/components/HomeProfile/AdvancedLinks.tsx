import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme';
import { useRouter } from 'expo-router';

const Container = styled(View)`
  margin-top: 10px; /* desce todo o componente */
  border: 0; /* remove borda */
  overflow: hidden;
  background-color: ${AppTheme.colors.cardBackground};
  elevation: 0; /* remove sombra/borda perceptível */
  padding: 0px 0; /* espaçamento interno */
`;

const LinkButton = styled(TouchableOpacity)`
  padding-vertical: 12px; /* aumenta o clique e o espaçamento */
  padding-horizontal: 0px;
`;

const LinkText = styled(Text)<{ isFirst?: boolean }>`
  font-family: ${AppTheme.fonts.titleMedium.fontFamily};
  font-size: ${AppTheme.fonts.titleMedium.fontSize + 3}px; /* aumenta fonte */
  font-weight: ${AppTheme.fonts.titleMedium.fontWeight};
  color: ${(props) => (props.isFirst ? AppTheme.colors.primary : AppTheme.colors.textColor)};
`;

const Divider = styled(View)`
  height: 0.6px;
  background-color: ${AppTheme.colors.placeholderText};
  
`;

interface AdvancedLinksProps {
  links: { title: string; onPress?: () => void }[];
}

export const AdvancedLinks: React.FC<AdvancedLinksProps> = ({ links }) => {
  const router = useRouter();

  return (
    <Container>
      {links.map((link, index) => (
        <React.Fragment key={index}>
          <LinkButton
            onPress={() => {
              if (index === 0) {
                router.push('/screens/profile/contatosView');
              } else {
                link.onPress?.();
              }
            }}
          >
            <LinkText isFirst={index === 0}>{link.title}</LinkText>
          </LinkButton>
          {index < links.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Container>
  );
};