import * as React from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { AppTheme } from '../../theme';

LocaleConfig.locales['pt'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt';

interface Props {
  onDayPress?: (day: { dateString: string }) => void;
  markedDates?: Record<string, any>;
}

export default function CCalendar({ onDayPress, markedDates }: Props) {
  const hoje = new Date();
  const current = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  return (
    <Calendar
      current={current}
      onDayPress={onDayPress}
      markedDates={markedDates}
      markingType="multi-dot"
      style={{ backgroundColor: 'transparent' }}
      theme={{
        backgroundColor: 'transparent',
        calendarBackground: 'transparent',
        textSectionTitleColor: AppTheme.colors.placeholderText,
        todayTextColor: '#fff',
        todayBackgroundColor: AppTheme.colors.tertiary,
        dayTextColor: AppTheme.colors.textColor,
        textDisabledColor: AppTheme.colors.dotsColor,
        selectedDayBackgroundColor: AppTheme.colors.primary,
        selectedDayTextColor: '#4A1A1A',
        arrowColor: AppTheme.colors.tertiary,
        monthTextColor: AppTheme.colors.nameText,
        textDayFontFamily: AppTheme.fonts.bodyMedium.fontFamily,
        textMonthFontFamily: AppTheme.fonts.titleMedium.fontFamily,
        textDayHeaderFontFamily: AppTheme.fonts.labelSmall.fontFamily,
        textDayFontWeight: '500',
        textMonthFontWeight: '700',
        textDayHeaderFontWeight: '600',
        dotColor: AppTheme.colors.primary,
        selectedDotColor: AppTheme.colors.primary,
      }}
    />
  );
}
