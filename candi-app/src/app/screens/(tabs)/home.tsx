import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import { StatusBar } from 'expo-status-bar';
import EmergencyContactCard, { EmergencyContact } from '../../../components/EmergencyContactCard';
import Timeline from '../../../components/Timeline';
import CommunityShortcut from '../../../components/Community-Shortcut';
import CarouselComponent from '../../../components/Carousel/carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api';
import { makePhoneCall } from '../../../services/PhoneService';
import { createPost } from '@/services/feedService';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const userEndpoint = `${API_BASE_URL}/auth/me`;
const contactsEndpoint = `${API_BASE_URL}/emergency-contact`;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

export default function HomeScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [userName, setUserName] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const carouselData = [
    { title: 'Equipe CANDI 1', image: require('../../../../assets/images/equipe-candi-1.jpeg') },
    { title: 'Equipe CANDI 2', image: require('../../../../assets/images/equipe-candi-2.jpeg') },
    { title: 'Equipe Rede', image: require('../../../../assets/images/equipe-candi-rede.jpeg') },
    { title: 'Rede Feminina', image: require('../../../../assets/images/site-rede-feminina.jpeg') },
  ];

  const handleCallContact = (contact: EmergencyContact) => {
    makePhoneCall(contact.phoneNumber);
  };

  const handleOpenMarcos = () => {
    router.push('/screens/profile/marcosView');
  };

  const handleDirectPost = async () => {
    if (!postContent.trim()) return;
    setIsPosting(true);
    try {
      await createPost(postContent, 'GERAL');
      Alert.alert('Publicado!', 'Sua mensagem foi enviada para a comunidade.');
      setPostContent('');
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a postagem.');
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;

        const [userRes, contactRes] = await Promise.all([
          fetch(userEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(contactsEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.profile_name);
        }

        if (contactRes.ok) {
          const contactsData = await contactRes.json();
          const mapped: EmergencyContact[] = contactsData.map((c: any) => ({
            name: c.name,
            role: c.relationship,
            phoneNumber: c.phone,
            photoUrl: c.photoUrl,
          }));
          setContacts(mapped);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    fetchData();
  }, []);

  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <PaperProvider theme={AppTheme}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Saudação */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}{firstName ? `, ${firstName}` : ''}! 👋
              </Text>
              <Text style={styles.subtitle}>
                Acompanhe seu tratamento e conecte-se com a comunidade.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Progresso do tratamento</Text>
          <Timeline onPress={handleOpenMarcos} />
        </View>

        {/* Carrossel */}
        <View style={styles.carouselSection}>
          <CarouselComponent data={carouselData} />
        </View>

        {/* Contatos de emergência */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contatos de emergência</Text>
            <TouchableOpacity
              onPress={() => router.push('/screens/profile/contatosView')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {contacts.length > 0 ? (
            contacts.slice(0, 3).map((c, i) => (
              <EmergencyContactCard key={i} contact={c} onPress={handleCallContact} />
            ))
          ) : (
            <View style={styles.emptyContacts}>
              <MaterialIcons name="person-add" size={32} color={AppTheme.colors.dotsColor} />
              <Text style={styles.emptyText}>Nenhum contato cadastrado ainda.</Text>
              <TouchableOpacity
                onPress={() => router.push('/screens/profile/contatosAdd')}
                style={styles.addContactBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.addContactBtnText}>Adicionar contato</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Atalho comunidade */}
        <View style={styles.sectionCommunity}>
          <CommunityShortcut
            value={postContent}
            onChangeText={setPostContent}
            onSend={handleDirectPost}
            loading={isPosting}
          />
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: {
    fontFamily: AppTheme.fonts.headlineSmall.fontFamily,
    fontSize: AppTheme.fonts.headlineSmall.fontSize,
    color: AppTheme.colors.textColor,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.placeholderText,
    marginTop: 4,
    lineHeight: 20,
  },
  sectionLabel: {
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: AppTheme.fonts.labelLarge.fontSize,
    color: AppTheme.colors.placeholderText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  carouselSection: {
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    fontSize: AppTheme.fonts.titleMedium.fontSize,
    color: AppTheme.colors.textColor,
  },
  seeAll: {
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
    fontSize: AppTheme.fonts.labelMedium.fontSize,
    color: AppTheme.colors.tertiary,
    fontWeight: '600',
  },
  emptyContacts: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.placeholderText,
    marginTop: 8,
    fontStyle: 'italic',
  },
  addContactBtn: {
    marginTop: 12,
    backgroundColor: AppTheme.colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addContactBtnText: {
    fontFamily: AppTheme.fonts.labelLarge.fontFamily,
    fontSize: AppTheme.fonts.labelLarge.fontSize,
    color: AppTheme.colors.tertiary,
    fontWeight: '600',
  },
  sectionCommunity: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
});

