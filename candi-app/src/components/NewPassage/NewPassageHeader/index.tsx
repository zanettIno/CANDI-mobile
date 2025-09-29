import * as React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Text, Menu } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import { useNavigation } from 'expo-router';

// A "lista de regras" que diz quais props o componente aceita.
// Agora está COMPLETA, com todas as funções necessárias.
interface NewPassageHeaderProps {
  onCalendarPress: () => void;
  onClearAll: () => void;
  onSaveAsDraft: () => void;
}

const NewPassageHeader: React.FC<NewPassageHeaderProps> = ({ onCalendarPress, onClearAll, onSaveAsDraft }) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleClearAll = () => {
    onClearAll();
    closeMenu();
  };
  
  const handleSaveAsDraft = () => {
    onSaveAsDraft();
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
        <IconButton
          icon="chevron-left"
          iconColor={AppTheme.colors.primary}
          size={28}
          style={styles.iconButton}
        />
        <Text style={styles.title}>Nova Passagem</Text>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        <IconButton
          icon="calendar-month-outline"
          iconColor={AppTheme.colors.tertiary}
          size={24}
          onPress={onCalendarPress}
        />
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="dots-vertical"
              iconColor={AppTheme.colors.tertiary}
              size={24}
              onPress={openMenu}
            />
          }
          anchorPosition="bottom"
        >
          <Menu.Item onPress={handleClearAll} title="Limpar tudo" leadingIcon="trash-can-outline" />
          <Menu.Item onPress={handleSaveAsDraft} title="Salvar como rascunho" leadingIcon="file-edit-outline" />
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: AppTheme.colors.background,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
  },
  title: {
    ...AppTheme.fonts.titleLarge,
    fontSize: 20,
    color: AppTheme.colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default NewPassageHeader;