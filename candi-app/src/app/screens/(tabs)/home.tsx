import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Keyboard, Dimensions, TouchableOpacity } from 'react-native';
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
import { createPost } from '@/services/feedService'; 
import { useRouter } from 'expo-router';
// 🔹 Importa o FAB de navegação
import NewPassageFAB from '../../../components/NewPassageFAB'; 

// Endpoints
const userEndpoint = `${API_BASE_URL}/auth/me`;
const contactsEndpoint = `${API_BASE_URL}/emergency-contact`;

export default function HomeScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [userName, setUserName] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // 🔹 Definição restaurada (para evitar o erro 'Cannot find name')
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

  // 🔹 FUNÇÃO DE NAVEGAÇÃO: Adiciona uma passagem de diário
  const handleOpenNewPassage = () => {
    router.push('/screens/diary/passagemAdd'); 
  };

  // FUNÇÃO DE POSTAGEM DIRETA
  const handleDirectPost = async () => {
    if (!postContent.trim()) return;
    setIsPosting(true);
    try {
      await createPost(postContent, 'Feed'); 
      Alert.alert('Sucesso', 'Sua mensagem foi enviada para a comunidade!');
      setPostContent(''); 
      Keyboard.dismiss(); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível enviar a postagem.');
    } finally {
      setIsPosting(false);
    }
  };

  // Lógica para buscar dados (Contatos e Usuário)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;

        const userRes = await fetch(userEndpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.profile_name);
        }

        // Busca Contatos de Emergência do Backend
        const contactRes = await fetch(contactsEndpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
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
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <PaperProvider theme={AppTheme}>
      <StatusBar style="dark"/>
      {/* Container principal para posicionamento absoluto */}
      <View style={styles.mainContainer}> 
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
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
            {contacts.length > 0 ? (
              contacts.map((c, i) => (
                <EmergencyContactCard key={i} contact={c} onPress={handleCallContact}/>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum contato cadastrado ainda.</Text>
            )}
          </View>

          {/* Atalho de Postagem (Input Funcional) */}
          <View style={styles.sectionCommunity}>
            <CommunityShortcut 
              value={postContent}
              onChangeText={setPostContent}
              onSend={handleDirectPost}
              loading={isPosting}
            />
          </View>

        </ScrollView>
        
        {/* 🔹 FAB DE NAVEGAÇÃO (Botão Lápis) - POSICIONAMENTO ABSOLUTO */}

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1, 
    backgroundColor: AppTheme.colors.background,
  },
  container: { 
    paddingBottom: 30,
  },
  header: { paddingHorizontal: 20, marginTop: 60, marginBottom: 10 },
  greeting: { fontFamily: AppTheme.fonts.titleLarge.fontFamily, fontSize: AppTheme.fonts.titleLarge.fontSize + 8, paddingTop: '8%', color: AppTheme.colors.textColor, lineHeight: AppTheme.fonts.headlineLarge.fontSize * 1.1, fontWeight: 'bold' },
  subtitle: { paddingHorizontal: 20, marginBottom: '1%', marginTop: '5%', fontSize: AppTheme.fonts.bodyMedium.fontSize, fontFamily: AppTheme.fonts.bodyMedium.fontFamily },
  section: { paddingHorizontal: 10 },
  sectionTitle: { fontSize: AppTheme.fonts.titleLarge.fontSize, fontFamily: AppTheme.fonts.titleLarge.fontFamily, color: AppTheme.colors.textColor, marginLeft: 10 },
  emptyText: { marginLeft: 20, marginTop: 10, color: AppTheme.colors.placeholderText, fontStyle: 'italic' },
  sectionCommunity: { marginTop: '8%', paddingHorizontal: 20, marginBottom: 20 },
  // 🔹 ESTILO DO FAB: Flutua no canto inferior direito
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});