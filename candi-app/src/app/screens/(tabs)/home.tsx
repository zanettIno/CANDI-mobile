import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import { StatusBar } from 'expo-status-bar';
import EmergencyContactCard, { EmergencyContact } from '../../../components/EmergencyContactCard';
import Timeline from '../../../components/Timeline';
import CommunityShortcut from "../../../components/Community-Shortcut";
import CarouselComponent from "../../../components/Carousel/carousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api'; 
import { makePhoneCall } from '../../../services/PhoneService';
import { useRouter } from 'expo-router';

const userEndpoint = `${API_BASE_URL}/auth/me`;

export default function HomeScreen() {
  const router = useRouter();

  const contacts: EmergencyContact[] = [
    {
      name: 'Vivian Zanon',
      role: 'Mãe',
      phoneNumber: '+55 (11) 99999-9999',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Red_Kitten_01.jpg',
    },
    {
      name: 'Nuna Yokoji',
      role: 'Enfermeira',
      phoneNumber: '+55 (11) 99999-9999',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg',
    },
  ];

  const carouselData = [
    { title: 'Equipe CANDI 1', image: require('../../../../assets/images/equipe-candi-1.jpeg') },
    { title: 'Equipe CANDI 2', image: require('../../../../assets/images/equipe-candi-2.jpeg') },
    { title: 'Equipe Rede', image: require('../../../../assets/images/equipe-candi-rede.jpeg') },
    { title: 'Rede Feminina', image: require('../../../../assets/images/site-rede-feminina.jpeg') },
  ];

  const [userName, setUserName] = useState('');

  const handleCallContact = (contact: EmergencyContact) => {
    console.log(`Iniciando chamada para ${contact.name} no número ${contact.phoneNumber}...`);
    makePhoneCall(contact.phoneNumber);
  };

  const handleOpenMarcos = () => {
    router.push('/screens/profile/marcosView');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');

        if (!token) {
          console.error("Nenhum token de acesso encontrado. O usuário precisa fazer login.");
          return;
        }

        const response = await fetch(userEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.profile_name);
        } else {
          console.error("Erro ao buscar dados do usuário: ", response.status);
        }
      } catch (error) {
        console.error("Erro de conexão ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <PaperProvider theme={AppTheme}>
      <StatusBar style="dark"/>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            OLÁ, {userName ? userName.toUpperCase() : '...'}
          </Text>
        
          <Text style={styles.subtitle}>Veja quanto falta para o fim do seu tratamento!</Text>
          <Timeline onPress={handleOpenMarcos} />
        </View>

        <View>
          <CarouselComponent data={carouselData} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contatos</Text>
          {contacts.map((c, i) => (
            <EmergencyContactCard key={i} contact={c} onPress={handleCallContact}/>
          ))}
        </View>

        <View style={styles.sectionCommunity}>
          <CommunityShortcut />
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 10,
  },
  greeting: {
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    fontSize: AppTheme.fonts.titleLarge.fontSize + 8,
    paddingTop: '8%',
    color: AppTheme.colors.textColor,
    lineHeight: AppTheme.fonts.headlineLarge.fontSize * 1.1,
    fontStyle: AppTheme.fonts.headlineLarge.fontStyle,
    fontWeight: 'bold',
  },
  subtitle: {
    paddingHorizontal: 20,
    marginBottom: '1%',
    marginTop: '5%',
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
  },
  section: {
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: AppTheme.fonts.titleLarge.fontSize,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    color: AppTheme.colors.textColor,
    marginLeft: 10,
  },
  sectionCommunity: {
    marginTop: '25%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
