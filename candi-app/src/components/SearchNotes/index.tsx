import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { AppTheme } from '../../theme';

const SearchNotes: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Pesquisar"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.input}
        placeholderTextColor={AppTheme.colors.placeholderText}
        iconColor={AppTheme.colors.placeholderText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8, 

  },
  searchbar: {
    borderRadius: AppTheme.roundness,
    backgroundColor: AppTheme.colors.cardBackground, 
    elevation: 2,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  input: {
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    color: AppTheme.colors.textColor,
  },
});

export default SearchNotes;