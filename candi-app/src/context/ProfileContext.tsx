import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

export type UserRole = 'patient' | 'admin' | 'support';
export type ProfileStatus = 'active' | 'banned';

interface ProfileCtx {
  profileId: string | null;
  profileName: string;
  avatarUri: string | null;
  role: UserRole;
  profileStatus: ProfileStatus;
  // Para usuário suporte: permissões concedidas pelo paciente
  supportPermissions: string[];
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileCtx>({
  profileId: null,
  profileName: '',
  avatarUri: null,
  role: 'patient',
  profileStatus: 'active',
  supportPermissions: [],
  refreshProfile: async () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('patient');
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('active');
  const [supportPermissions, setSupportPermissions] = useState<string[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setProfileId(data.profile_id);
      setProfileName(data.profile_name || '');
      setRole(data.role || 'patient');
      setProfileStatus(data.profile_status || 'active');

      const ts = data.profile_picture_last_updated ? `?t=${data.profile_picture_last_updated}` : '';
      setAvatarUri(`${S3_BASE}/${data.profile_id}.jpg${ts}`);

      // Para usuário de suporte: carrega as permissões concedidas pelo paciente
      if (data.role === 'support') {
        try {
          const patientRes = await fetch(`${API_BASE_URL}/auth/my-patient`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (patientRes.ok) {
            const patientData = await patientRes.json();
            setSupportPermissions(patientData?.permissions || []);
          }
        } catch { /* silencioso */ }
      }
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { fetchProfile(); }, []);

  return (
    <ProfileContext.Provider
      value={{ profileId, profileName, avatarUri, role, profileStatus, supportPermissions, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
