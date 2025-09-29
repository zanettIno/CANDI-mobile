import * as React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme';

const Title = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: ${AppTheme.colors.textColor};
`;

export const AdvancedSettings = () => <Title>Configurações Avançadas</Title>;
