import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme';
import { useRouter } from 'expo-router';

const Container = styled(View)`
  margin-top: 20px;
  overflow: hidden;
  background-color: ${AppTheme.colors.cardBackground};
  elevation: 1;
`;

const LinkButton = styled(TouchableOpacity)`
  padding-top: 10px;
`;

const LinkText = styled(Text)<{ isFirst?: boolean }>`
  font-family: ${AppTheme.fonts.titleMedium.fontFamily};
  font-size: ${AppTheme.fonts.titleMedium.fontSize}px;
  font-weight: ${AppTheme.fonts.titleMedium.fontWeight};
  color: ${props => (props.isFirst ? AppTheme.colors.primary : AppTheme.colors.textColor)};
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
                router.push("/screens/profile/contatosView");
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
