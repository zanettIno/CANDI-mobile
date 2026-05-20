import { useState } from 'react';
import {
  View, Image, StyleSheet, TouchableOpacity, Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTheme } from '../../theme';
import { useProfile } from '../../context/ProfileContext';

const S3 = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

interface Props {
  onAvatarPress?: () => void;
  /** Quando passado, exibe o avatar do paciente ao invés do próprio avatar (modo suporte) */
  patientId?: string | null;
  patientName?: string | null;
  onPatientPress?: () => void;
}

export default function CANDITopBar({ onAvatarPress, patientId, patientName, onPatientPress }: Props) {
  const insets = useSafeAreaInsets();
  const { avatarUri, profileName } = useProfile();
  const [imgError, setImgError] = useState(false);

  const isSupport = !!patientId;
  const activeUri = isSupport ? `${S3}/${patientId}.jpg` : avatarUri;
  const initials = (isSupport ? patientName : profileName)?.substring(0, 2).toUpperCase() ?? '?';
  const showFallback = !activeUri || imgError;

  return (
    <View style={[s.bar, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity
        onPress={isSupport ? onPatientPress : onAvatarPress}
        activeOpacity={0.8}
        style={[s.avatarWrap, isSupport && s.avatarWrapPatient]}
      >
        {showFallback ? (
          <View style={[s.avatarFallback, isSupport && s.avatarFallbackPatient]}>
            <Text style={[s.avatarInitials, isSupport && s.avatarInitialsPatient]}>{initials}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: activeUri! }}
            style={s.avatar}
            onError={() => setImgError(true)}
          />
        )}
      </TouchableOpacity>

      <Image
        source={require('../../../assets/images/original.png')}
        style={s.logo}
        resizeMode="contain"
      />

      <View style={s.rightSpacer} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
  },
  avatarWrap: {
    width: 34, height: 34, borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: AppTheme.colors.primary,
  },
  avatarWrapPatient: {
    borderColor: AppTheme.colors.tertiary,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: {
    width: '100%', height: '100%',
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarFallbackPatient: {
    backgroundColor: AppTheme.colors.tertiary + '30',
  },
  avatarInitials: {
    fontSize: 12, fontWeight: '700', color: '#1a4a30',
  },
  avatarInitialsPatient: {
    color: AppTheme.colors.tertiary,
  },
  logo: { width: 110, height: 44 },
  rightSpacer: { width: 34 },
});
