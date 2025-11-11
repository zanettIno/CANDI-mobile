import React from 'react';
import { View, TextInput } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
`;

const LocationField = styled(TextInput)`
  background-color: ${AppTheme.colors.background};
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  border: 1px solid transparent;
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
`;

const IconContainer = styled(View)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
`;

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Ex.: Unidade de Santos',
  style,
}) => {
  return (
    <Container style={style}>
      <LocationField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppTheme.colors.placeholderText}
      />
      <IconContainer>
        <MaterialIcons
          name="location-on"
          size={24}
          color={AppTheme.colors.tertinaryTextColor}
        />
      </IconContainer>
    </Container>
  );
};
