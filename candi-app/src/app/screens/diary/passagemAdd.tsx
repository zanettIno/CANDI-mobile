import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AppTheme } from '../../../theme';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NewPassageHeader from '../../../components/NewPassage/NewPassageHeader';
import DiaryTextInput from '../../../components/NewPassage/DiaryTextInput';
import MoodSelector from '../../../components/NewPassage/MoodSelector';
import SaveButton from '../../../components/NewPassage/SaveButton';

const NewPassageScreen = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [mood, setMood] = useState('🙂');
  const [isSaving, setIsSaving] = useState(false);
  const [isClearDialogVisible, setClearDialogVisible] = useState(false);
  const showClearDialog = () => setClearDialogVisible(true);
  const hideClearDialog = () => setClearDialogVisible(false);

  useEffect(() => {
    if (date) {
      setTitle(`Passagem do dia ${format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`);
    }
  }, [date]);

  const onDismissDatePicker = useCallback(() => setDatePickerVisible(false), []);
  const onConfirmDatePicker = useCallback((params: { date: Date | undefined }) => {
    setDatePickerVisible(false);
    setDate(params.date);
  }, []);
  
  const handleClearAll = () => showClearDialog();
  const onConfirmClear = () => {
    setTitle('');
    setBodyText('');
    hideClearDialog();
  };
  const handleSaveAsDraft = () => console.log('Salvando rascunho...');
  const handleSavePassage = () => console.log('Salvando passagem...');
  const handleOpenMoodModal = () => console.log('Abrir seletor de humor');
  
  return (
    <SafeAreaProvider style={styles.provider}>
      <View style={styles.safeArea}>
          <NewPassageHeader 
              onCalendarPress={() => setDatePickerVisible(true)}
              onClearAll={handleClearAll}
              onSaveAsDraft={handleSaveAsDraft}
          />
          
          <DatePickerModal
            locale="pt" mode="single" visible={isDatePickerVisible}
            onDismiss={onDismissDatePicker} date={date} onConfirm={onConfirmDatePicker}
          />

          <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
          >
              <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
              >
                  <View style={styles.inputsContainer}>
                      <DiaryTextInput variant="title" value={title} onChangeText={setTitle} />
                      <DiaryTextInput variant="body" value={bodyText} onChangeText={setBodyText} placeholder="Digite seu texto..." multiline />
                  </View>
                  <View style={styles.bottomContainer}>
                      <MoodSelector currentMoodEmoji={mood} onPress={handleOpenMoodModal} />
                      <SaveButton onPress={handleSavePassage} loading={isSaving} />
                  </View>
              </ScrollView>
          </KeyboardAvoidingView>


          <Portal>
            <Dialog 
              visible={isClearDialogVisible} 
              onDismiss={hideClearDialog}
              style={styles.dialog} 
            >
              <Dialog.Title style={styles.dialogTitle}>Limpar Tudo</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium" style={styles.dialogContentText}>
                  Tem certeza que deseja apagar o conteúdo?
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideClearDialog} textColor={AppTheme.colors.primary}>
                  Cancelar
                </Button>
                <Button onPress={onConfirmClear} textColor={AppTheme.colors.error}>
                  Apagar
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  provider: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
  inputsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  bottomContainer: { padding: 16 },
  
  dialog: {
    borderRadius: 28, 
    backgroundColor: '#F8F0F0', 
  },
  dialogTitle: {
  },
  dialogContentText: {
  }
});

export default NewPassageScreen;