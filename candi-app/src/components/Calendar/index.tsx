import * as React from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { AppTheme } from '../../theme';

export default function CCalendar() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    const dia = hoje.getDate();

    LocaleConfig.locales['fr'] = {
        monthNames: [
        'Janeiro',
        'Fevereiro',
        'Marco',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'],

        monthNamesShort: [
        'Jav', 
        'Fev', 
        'Mar', 
        'Abril', 
        'Mai', 
        'Jun', 
        'Jul', 
        'Ago', 
        'Sep', 
        'Out', 
        'Nov', 
        'Dez'],

        dayNames: [
        'Domingo', 
        'Segunda-feira', 
        'Terca-feira', 
        'Quarta-feira', 
        'Quinta-feira', 
        'Sexta-feira', 
        'Sabado'],

        dayNamesShort: [
        'Dom', 
        'Seg', 
        'Ter', 
        'Qua', 
        'Qui', 
        'Sex', 
        'Sab'],

        today: "Hoje"
    };

LocaleConfig.defaultLocale = 'fr';

  return (
    <PaperProvider>
      <View style={{bottom: '57%'}}>
        <Calendar
  style={{
    backgroundColor: 'transparent',
    height: '25%',
    width: 350,
  }}
  current={`${ano}-${mes}-${dia}`}
  theme={{
    backgroundColor: 'transparent',
    calendarBackground: AppTheme.colors.primary, 
    textSectionTitleColor: AppTheme.colors.background, 
    todayTextColor: AppTheme.colors.background, 
    todayBackgroundColor: AppTheme.colors.tertiaryLight,
    dayTextColor: AppTheme.colors.background, 
    textDisabledColor: AppTheme.colors.secondary, 
    arrowColor: AppTheme.colors.background, 
    monthTextColor: AppTheme.colors.background, 
    textDayFontWeight: 'bold', 
    textMonthFontWeight: 'bold', 
    textDayHeaderFontWeight: 'bold',
  }}
  onDayPress={day => {
    console.log('selected day', day);
  }}
/>
      </View>
    </PaperProvider>
  );
}