import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

interface CheckpointCardOptionsProps {
  name: string;
  onEdit: () => void;
  onMarkAsCompleted: () => void;
  onDelete: () => void;
  isCompleted: boolean;
}

const CheckpointCardOptions: React.FC<CheckpointCardOptionsProps> = ({
  name,
  onEdit,
  onMarkAsCompleted,
  onDelete,
  isCompleted,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleEdit = () => {
    setModalVisible(false);
    onEdit();
  };

  const handleMarkAsCompleted = () => {
    setModalVisible(false);
    onMarkAsCompleted();
  };

  const handleDelete = () => {
    setModalVisible(false);
    onDelete();
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <MaterialIcons name="more-horiz" size={24} color={AppTheme.colors.tertinaryTextColor} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.centeredView}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{name}</Text>
            
            {!isCompleted && (
              <TouchableOpacity style={styles.optionButton} onPress={handleMarkAsCompleted}>
                <Text style={styles.optionText}>Marcar como alcançado</Text>
              </TouchableOpacity>
            )}

            {isCompleted && (
              <TouchableOpacity style={styles.optionButton} onPress={handleMarkAsCompleted}>
                <Text style={styles.optionText}>Marcar como pendente</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionButton} onPress={handleEdit}>
              <Text style={styles.optionText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionButton, styles.deleteButton]} onPress={handleDelete}>
              <Text style={[styles.optionText, styles.deleteText]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    fontWeight: 'bold',
    color: AppTheme.colors.nameText,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: AppTheme.colors.placeholderBackground,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.nameText,
  },
  deleteButton: {
    backgroundColor: AppTheme.colors.error, 
    marginTop: 15,
  },
  deleteText: {
    color: AppTheme.colors.cardBackground, 
    fontWeight: 'bold',
  }
});

export default CheckpointCardOptions;
