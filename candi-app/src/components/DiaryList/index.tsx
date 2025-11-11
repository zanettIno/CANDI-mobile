import * as React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { AppTheme } from '../../theme';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DiaryEntry = {
  id: string;
  title: string;
  date: string;
  content: string;
};

type DiaryListProps = {
  entries: DiaryEntry[];
};

const DiaryList: React.FC<DiaryListProps> = ({ entries }) => {

  const renderItem = ({ item }: { item: DiaryEntry }) => (
    <List.Item
      title={item.title}
      titleStyle={styles.listItemTitle}
      onPress={async () => {
        try {
          console.log('Storing date:', item.date); // Debug log
          // Store the selected diary date temporarily
          await AsyncStorage.setItem('selectedDiaryDate', item.date);
          // Navigate to passagemRead (in the diary folder within tabs)
          router.push('/screens/diary/passagemRead');
        } catch (error) {
          console.error('Error storing diary date:', error);
        }
      }}
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