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
import ProfilePictureModal from '../../../components/Modals/ProfilePictureModal';

interface UserProfile {
    profile_id: string;
    profile_name: string;
    profile_email: string;
    profile_birth_date: string;
    cancer_type_id: number;
    profile_picture_last_updated?: number;
}

export default function HomeScreen() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) return;
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: 'GET',
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

    const handlePictureUpdate = (isDeletion: boolean = false) => {
    if (profile) {
        setProfile({
            ...profile,
            profile_picture_last_updated: isDeletion ? undefined : new Date().getTime(),
        });
    }
};
    
    const cancerTypeName = profile
        ? cancerTypes.find(c => c.id === profile.cancer_type_id)?.name || 'Não especificado'
        : '...';

    let formattedBirthDate = '...';
    if (profile?.profile_birth_date) {
        const datePart = profile.profile_birth_date.split('T')[0];
        const [year, month, day] = datePart.split('-');
        formattedBirthDate = `${day}/${month}/${year}`;
    }

    const getAvatarUri = () => {
        if (!profile || !profile.profile_picture_last_updated) {
        return undefined;
    }
        const baseUrl = `https://candi-image-uploads.s3.us-east-1.amazonaws.com/profile-images/${profile.profile_id}.jpg`;
        return `${baseUrl}?timestamp=${profile.profile_picture_last_updated || new Date().getTime()}`;
    };

    return (
        <>
            <HomeBackground onSettingsPress={() => console.log('⚙️ Configurações clicadas')}>
                <ContentContainer>
                    <ProfileCard
                        name={profile?.profile_name || '...'}
                        username={profile?.profile_email || '...'}
                        userType="Paciente oncológico"
                        avatarUri={getAvatarUri()}
                        onFirePress={() => console.log('🔥 Fire')}
                        onBrushPress={() => setModalVisible(true)}
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

            {profile && (
                 <ProfilePictureModal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    user={profile}
                    onPictureUpdate={handlePictureUpdate}
                 />
            )}
        </>
    );
}