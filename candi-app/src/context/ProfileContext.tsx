import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

const S3_BASE = 'https://awscandi-image-uploads.s3.us-east-2.amazonaws.com/profile-images';

interface ProfileCtx {
  profileId: string | null;
  profileName: string;
  avatarUri: string | null;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileCtx>({
  profileId: null,
  profileName: '',
  avatarUri: null,
  refreshProfile: async () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const fetchProfile = async () => {
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

      if (data.profile_picture_last_updated) {
        setAvatarUri(`${S3_BASE}/${data.profile_id}.jpg?t=${data.profile_picture_last_updated}`);
      } else {
        setAvatarUri(null);
      }
    } catch {
      // falha silenciosa — não bloqueia o app
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  return (
    <ProfileContext.Provider
      value={{ profileId, profileName, avatarUri, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
