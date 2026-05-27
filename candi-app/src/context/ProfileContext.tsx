import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

export type UserRole = 'patient' | 'admin' | 'support';

export interface LinkedPatient {
  profile_id: string;
  profile_name: string;
  profile_nickname?: string;
  permissions: string[];
  linked_at: string;
}
export type ProfileStatus = 'active' | 'banned';

interface ProfileCtx {
  profileId: string | null;
  profileName: string;
  avatarUri: string | null;
  role: UserRole;
  profileStatus: ProfileStatus;
  // Para usuário suporte: lista de todos os pacientes vinculados
  linkedPatients: LinkedPatient[];
  // Paciente atualmente selecionado (suporte pode ter vários)
  selectedPatient: LinkedPatient | null;
  setSelectedPatient: (p: LinkedPatient | null) => void;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileCtx>({
  profileId: null,
  profileName: '',
  avatarUri: null,
  role: 'patient',
  profileStatus: 'active',
  linkedPatients: [],
  selectedPatient: null,
  setSelectedPatient: () => {},
  refreshProfile: async () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('patient');
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('active');
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<LinkedPatient | null>(null);

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

      // Para usuário de suporte: carrega TODOS os pacientes vinculados
      if (data.role === 'support') {
        try {
          const patientsRes = await fetch(`${API_BASE_URL}/auth/my-patients`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (patientsRes.ok) {
            const patients: LinkedPatient[] = await patientsRes.json();
            setLinkedPatients(patients);
            // Auto-seleciona o primeiro se não tiver selecionado
            if (patients.length > 0) {
              setSelectedPatient(prev => prev ?? patients[0]);
            }
          }
        } catch { /* silencioso */ }
      }
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { fetchProfile(); }, []);

  return (
    <ProfileContext.Provider
      value={{ profileId, profileName, avatarUri, role, profileStatus, linkedPatients, selectedPatient, setSelectedPatient, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
