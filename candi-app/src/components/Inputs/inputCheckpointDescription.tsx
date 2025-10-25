import React from 'react';
import { View, TextInput, Text } from 'react-native';
import styled from 'styled-components/native';
import { AppTheme } from '../../theme'; 

interface CheckpointDescription {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
`;

const StyledTextInput = styled(TextInput)`
  background-color: ${AppTheme.colors.background};
  border-radius: 50px;
  padding: 16px;
  border: 1px solid transparent;
  min-height: 56px; 
  
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
`;

const LabelText = styled(Text)`
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  font-weight: bold;
  color: ${AppTheme.colors.nameText}; 
  margin-bottom: 8px;
  margin-left: 16px;
`;

export const MilestoneDescriptionInput: React.FC<CheckpointDescription> = ({
  value,
  onChangeText,
  placeholder = "Descrição do marco",
  style
}) => {
  return (
    <Container style={style}>
      <LabelText>Descrição do marco</LabelText>
      <StyledTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppTheme.colors.placeholderText}
        multiline={false}
      />
    </Container>
  );
};
