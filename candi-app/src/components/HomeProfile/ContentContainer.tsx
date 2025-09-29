import * as React from 'react';
import { View, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme';

const { height } = Dimensions.get('window');

const Container = styled(View)`
  flex: 1;
  background-color: white;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  padding: 20px;

`;

export const ContentContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Container>{children}</Container>;
};
