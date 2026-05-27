import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('candi', {
      name: 'CANDI',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Agenda: notifica 1 hora antes do compromisso
export async function scheduleAppointmentNotification(
  name: string,
  date: string,   // YYYY-MM-DD
  time: string,   // HH:MM
): Promise<string | null> {
  try {
    const granted = await requestPermissions();
    if (!granted) return null;

    const [h, m] = time.split(':').map(Number);
    const trigger = new Date(`${date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
    trigger.setHours(trigger.getHours() - 1);

    if (trigger <= new Date()) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Compromisso em 1 hora',
        body: name,
        sound: 'default',
      },
      trigger,
    });
  } catch { return null; }
}

// Remédio: notifica diariamente no horário informado
export async function scheduleMedicineNotification(
  name: string,
  dosage: string,
  hour: number,
  minute: number,
): Promise<string | null> {
  try {
    const granted = await requestPermissions();
    if (!granted) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: ' Hora do remédio',
        body: `${name} — ${dosage}`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch { return null; }
}

export async function cancelNotification(id: string) {
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch { }
}
