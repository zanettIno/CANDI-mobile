import * as React from 'react';
import { useState, useEffect } from 'react';
import { HomeBackground } from '../../../components/HomeProfile/HomeBackground';
import { ContentContainer } from '../../../components/HomeProfile/ContentContainer';
import { ProfileCard } from '../../../components/HomeProfile/ProfileCard';
import { LabelsRow } from '../../../components/HomeProfile/LabelsRow';
import { Separator } from '../../../components/HomeProfile/Separator';
import { AdvancedSettings } from '../../../components/HomeProfile/AdvancedSettings';
import { AdvancedLinks } from '@/components/HomeProfile/AdvancedLinks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api'; 
import { cancerTypes } from '@/components/Inputs/inputTypeCancer';

interface UserProfile {
   profile_id: string;
  profile_name: string;
  profile_email: string;
  profile_birth_date: string; 
  cancer_type_id: number;
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };
    
    fetchProfileData();
  }, []);

  const cancerTypeName = profile
    ? cancerTypes.find(c => c.id === profile.cancer_type_id)?.name || 'Não especificado'
    : '...';

  let formattedBirthDate = '...';
  if (profile?.profile_birth_date) {
    const [year, month, day] = profile.profile_birth_date.split('-');
    formattedBirthDate = `${day}/${month}/${year}`;
  }

  return (
    <HomeBackground onSettingsPress={() => console.log('⚙️ Configurações clicadas')}>
      <ContentContainer>
    <ProfileCard
  name={profile?.profile_name || '...'}
  username={profile?.profile_email || '...'}
  userType="Paciente oncológico"
  avatarUri={
    profile
      ? `https://candi-image-uploads.s3.us-east-1.amazonaws.com/profile-images/${profile?.profile_id || '...'}.jpg`
      : undefined
  }
  onFirePress={() => console.log('🔥 Fire')}
  onBrushPress={() => console.log('✏️ Brush')}
/>



        <LabelsRow 
          labels={[cancerTypeName, formattedBirthDate, profile?.profile_email]} 
        />

        <Separator />

        <AdvancedSettings />
        <AdvancedLinks
          links={[
            { title: 'Contatos de Emergência  >' }, 
            { title: 'Ajuda', onPress: () => console.log('Ajuda clicado') },
            { title: 'Sobre', onPress: () => console.log('Sobre clicado') },
          ]}
        />
      </ContentContainer>
    </HomeBackground>
  );
}