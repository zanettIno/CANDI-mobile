import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme/index'; 
import SymptomCard from '../../../components/Card/SymptomCard'; 
import AddButton from '../../../components/Buttons/AddButton';
import BackIconButton from '@/components/BackIconButton';
import { router, useRouter } from 'expo-router';

export default function SintomasView() {

  const router = useRouter();
  const symptoms = [
    {
      symptoms: 'Dor, náuseas, fadiga',
      date: '17/03/2025',
      reminderStatus: 'Ativo',
      otherInfo: 'Sim',
    },
    {
      symptoms: 'Dor, náuseas, fadiga',
      date: '17/03/2025',
      reminderStatus: 'Ativo',
      otherInfo: 'Sim',
    },
  ];

  const handleOptionsPress = () => {
    console.log('Options pressed');
  };

  const handleAddSymptom = () => {
    console.log('Add symptom pressed');
  };

  const handleReminderPress = () => {
    console.log('Reminder pressed');
  };

  const handleOtherInfoPress = () => {
    console.log('Other info pressed');
  };

  return (
    <PaperProvider theme={AppTheme}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerBackgroundRed} />
          <View style={styles.statusBar}>
            <BackIconButton 
              color={AppTheme.colors.cardBackground} 
              bottom={-30} 
              left={-10} 
              onPress={() => router.push("/screens/(tabs)/homeAgenda")} 
            />
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={styles.inactiveTab} onPress={() => router.push("/screens/agenda/medicamentosView")}>
              <Text style={styles.inactiveTabText}>Medicamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>Sintomas</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>LISTA DE SINTOMAS</Text>

          <AddButton text="Adicionar sintoma" onPress={() => router.push('/screens/agenda/sintomasAdd')} style={styles.addButton} />

          <ScrollView style={styles.cardsContainer}>
            {symptoms.map((symptom, index) => (
              <SymptomCard
                key={index}
                symptoms={symptom.symptoms}
                date={symptom.date}
                reminderStatus={symptom.reminderStatus as 'Ativo' | 'Inativo'}
                otherInfo={symptom.otherInfo as 'Sim' | 'Não'}
                onOptionsPress={handleOptionsPress}
                onReminderPress={handleReminderPress}
                onOtherInfoPress={handleOtherInfoPress}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    height: 150, 
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerBackgroundRed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: AppTheme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  statusBar: {
    position: 'absolute',
    top: 10,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: AppTheme.fonts.bodyMedium.fontWeight,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.nameText,
  },
  contentCard: {
    flex: 1,
    backgroundColor: AppTheme.colors.cardBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -60,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.placeholderBackground,
  },
  activeTab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: AppTheme.colors.tertiary,
  },
  activeTabText: {
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
    fontWeight: AppTheme.fonts.bodyLarge.fontWeight,
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    color: AppTheme.colors.tertiary,
  },
  inactiveTab: {
    paddingVertical: 10,
  },
  inactiveTabText: {
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
    fontWeight: AppTheme.fonts.bodyLarge.fontWeight,
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    color: AppTheme.colors.placeholderText,
  },
  listTitle: {
    fontSize: AppTheme.fonts.titleLarge.fontSize,
    fontWeight: AppTheme.fonts.titleLarge.fontWeight,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    color: AppTheme.colors.nameText,
    marginBottom: 15,
    textAlign: 'center',
  },
  addButton: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  cardsContainer: {
    flex: 1,
  },
});


