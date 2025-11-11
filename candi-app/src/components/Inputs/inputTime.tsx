import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

interface TimeInputProps {
  value: string;
  onPress: () => void;
  placeholder?: string;
  style?: any;
}

const Container = styled(View)`
  position: relative;
  margin-bottom: 16px;
`;

const TimeButton = styled(TouchableOpacity)`
  background-color: ${AppTheme.colors.background};
  border-radius: 50px;
  padding: 16px 50px 16px 16px;
  border: 1px solid transparent;
  flex-direction: row;
  align-items: center;
`;

const TimeText = styled(Text)`
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  color: ${AppTheme.colors.tertinaryTextColor};
`;

const PlaceholderText = styled(Text)`
  font-family: ${AppTheme.fonts.bodyLarge.fontFamily};
  font-size: ${AppTheme.fonts.bodyLarge.fontSize}px;
  color: ${AppTheme.colors.placeholderText};
`;

const IconContainer = styled(View)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
`;

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onPress,
  placeholder = "Ex.: 13:00",
  style
}) => {
  return (
    <Container style={style}>
      <TimeButton onPress={onPress}>
        {value ? (
          <TimeText>{value}</TimeText>
        ) : (
          <PlaceholderText>{placeholder}</PlaceholderText>
        )}
      </TimeButton>
      <IconContainer>
        <MaterialIcons
          name="access-time"
          size={24}
          color={AppTheme.colors.tertinaryTextColor}
        />
      </IconContainer>
    </Container>
  );
};