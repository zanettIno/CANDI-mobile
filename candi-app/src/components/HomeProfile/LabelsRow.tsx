import * as React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme';

const Row = styled(View)`
  flex-direction: column;
  gap: 20px;
  justify-content: space-between;
  margin-top: 110px; 
`;

const Label = styled(View)`
  background-color: #f0f0f0;
  padding: 16px 16px;
  border-radius: 20px;
`;

const LabelText = styled(Text)`
  color: ${AppTheme.colors.textColor};
  font-size: 16px;
`;

export const LabelsRow = ({ labels }: { labels: string[] }) => {
  return (
    <Row>
      {labels.map((label, index) => (
        <Label key={index}>
          <LabelText>{label}</LabelText>
        </Label>
      ))}
    </Row>
  );
};