import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Platform  } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

export type EmergencyContact = {
  name: string;
  role: string;
  phoneNumber: string;
  photoUrl?: string;
};

type Props = {
  contact: EmergencyContact;
  onPress?: (contact: EmergencyContact) => void;
};

const EmergencyContactCard: React.FC<Props> = ({ contact, onPress }) => {
  const { name, role, phoneNumber, photoUrl } = contact;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress?.(contact)}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.placeholder]}>
          <Text style={styles.initials}>{getInitials(name)}</Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        <View style={styles.phoneContainer}>
          <Feather name="phone" size={14} color={AppTheme.colors.phoneText} />
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        }
      : {
          shadowColor: AppTheme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
        }),
    elevation: 5,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholder: {
    backgroundColor: AppTheme.colors.placeholderBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: AppTheme.fonts.bodyLarge.fontSize,
    fontFamily: AppTheme.fonts.bodyLarge.fontFamily,
    color: AppTheme.colors.placeholderText,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    fontFamily: AppTheme.fonts.titleMedium.fontFamily,
    color: AppTheme.colors.nameText,
  },
  role: {
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.roleText,
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneNumber: {
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    color: AppTheme.colors.phoneText,
    marginLeft: 8,
  },
});

export default EmergencyContactCard;
