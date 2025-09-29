import * as React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';

const Line = styled(View)`
  height: 1px;
  background-color: #ccc;
  margin-vertical: 20px;
`;

export const Separator = () => <Line />;
