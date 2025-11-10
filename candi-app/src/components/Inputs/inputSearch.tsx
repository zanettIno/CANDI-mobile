import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';

const SearchContainer = styled(View)`
  position: relative;
`;

const SearchField = styled(TextInput)`
  background-color: ${AppTheme.colors.formFieldColor};
  border-radius: ${AppTheme.roundness}px;
  padding: 12px 50px 12px 16px; 
  
  font-size: 20px;
  color: ${AppTheme.colors.tertinaryTextColor};
  border: 1px solid transparent;
  
  shadow-color: ${AppTheme.colors.shadow};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

const IconContainer = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
  
  top: 0;
  bottom: 0;
  justify-content: center; 
`;

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
  style?: any; 
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Pesquisar',
  value,
  onChangeText,
  onSearch,
  style,
}) => {
  return (
    <SearchContainer style={style}>
      <SearchField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppTheme.colors.placeholderText}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />
      <IconContainer onPress={onSearch} disabled={!onSearch}>
        <MaterialIcons
          name="search"
          size={24}
          color={AppTheme.colors.placeholderText}
        />
      </IconContainer>
    </SearchContainer>
  );
};

export default SearchInput;