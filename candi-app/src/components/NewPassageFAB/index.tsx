import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { AppTheme } from '../../theme';

type NewPassageFABProps = {
  onPress: () => void;
};

const NewPassageFAB: React.FC<NewPassageFABProps> = ({ onPress }) => (
  <FAB
    icon="pencil"
    style={styles.fab}
    onPress={onPress}
    color={AppTheme.colors.cardBackground}
    animated
    accessibilityLabel="Adicionar novo registro"
  />
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    zIndex: 100,
    margin: 24,
    marginBottom: 64,
    right: 0,
    bottom: 0,
    backgroundColor: AppTheme.colors.primary,
  },
});

export default NewPassageFAB;
