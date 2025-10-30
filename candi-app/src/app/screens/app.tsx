import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/api';

interface Community {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function CommunitiesScreen() {
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Recupera token do AsyncStorage
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/community/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`, // token bonitinho
          },
        });

        // Checa se token é inválido
        if (response.status === 401) {
          setError('Token inválido ou expirado');
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setMyCommunities(data);
        } else {
          setMyCommunities([]);
          console.warn('API retornou dados inesperados:', data);
        }
      } catch (err) {
        console.error('Erro ao buscar comunidades:', err);
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (myCommunities.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Nenhuma comunidade encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {myCommunities.map((community) => (
        <View key={community.id} style={styles.communityCard}>
          {community.imageUrl && (
            <Image source={{ uri: community.imageUrl }} style={styles.communityImage} />
          )}
          <Text style={styles.communityName}>{community.name}</Text>
          {community.description && (
            <Text style={styles.communityDescription}>{community.description}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  communityCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  communityImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  communityDescription: {
    fontSize: 14,
    color: '#555',
  },
});
