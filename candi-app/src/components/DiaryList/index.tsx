import * as React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { AppTheme } from '../../theme'; 

type DiaryEntry = {
  id: string;
  title: string;
};

type DiaryListProps = {
  entries: DiaryEntry[];
};

const DiaryList: React.FC<DiaryListProps> = ({ entries }) => {

  const renderItem = ({ item }: { item: DiaryEntry }) => (
    <List.Item
      title={item.title}
      titleStyle={styles.listItemTitle}
      onPress={() => console.log('Abriu a passagem:', item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.tertiary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden', 
    marginTop: 16,
  },
  listContent: {
    paddingVertical: 8, 
  },
  listItemTitle: {
    ...AppTheme.fonts.bodyLarge,
    color: AppTheme.colors.cardBackground, 
    fontWeight: '500',
  },
  divider: {
    backgroundColor: AppTheme.colors.tertiaryLight, 
    marginHorizontal: 16, 
  },
});

export default DiaryList;