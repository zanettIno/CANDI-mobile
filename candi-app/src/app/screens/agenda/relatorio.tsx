import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import CandiLogo from '@/components/WhiteCandiLogo';
import BackIconButton from '@/components/BackIconButton';
import { AppTheme } from '../../../theme';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../constants/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Relatorio() {
  const [userUid, setUserUid] = useState('');
  const [reportData, setReportData] = useState({
    items: []
  });

  const [loading, setLoading] = useState(false);
  const userEndpoint = `${API_BASE_URL}/auth/me`;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("entrou no try")
        const token = await AsyncStorage.getItem('accessToken');

        if (!token) {
          console.log("nao achou token")
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
          console.log("recebemos data")
          const data = await response.json();
          setUserUid(data.profile_id);
        } else {
          console.error("Erro ao buscar dados do usuário: ", response.status);
        }
      } catch (error) {
        console.error("Erro de conexão ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleReceiveReport = async () => {
    if (!userUid) {
      console.error('User UID not available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://aruaf5hme7.execute-api.us-east-1.amazonaws.com/prod/ia/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userUid
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Report received successfully:', data);
        
        const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data;
        
        if (bodyData.ai_analysis) {
          const analysisText = bodyData.ai_analysis;
          setReportData({
            items: [analysisText] 
          });
        }
      } else {
        console.error('Error receiving report:', response.status);
        const errorData = await response.text();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error sending report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: AppTheme.colors.cardBackground }}>
        <View style={{height: '5%'}}/>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20
        }}>
          <BackIconButton 
            left={10} 
            top={53}
            color={AppTheme.colors.primary}
          />
          
          <View style={{ flex: 1, alignItems: 'center', marginLeft: -50 }}>
            <CandiLogo 
              bottom={-5} 
              left={40}
              version={require('../../../../assets/images/original.png')}
            />
          </View>
          
          <MaterialIcons name="notifications-none" size={28} color={AppTheme.colors.primary} />
        </View>

        {/* Main content */}
        <View style={{ flex: 1, paddingHorizontal: 30 }}>
          {/* Title */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Text style={{
              fontFamily: AppTheme.fonts.displayLarge.fontFamily,
              fontSize: 20,
              fontWeight: '600',
              color: '#333'
            }}>
              Relatório Geral
            </Text>
          </View>

          {/* Content section */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {loading ? (
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <ActivityIndicator size="large" color={AppTheme.colors.primary} />
                <Text style={{ marginTop: 10, color: '#666' }}>Gerando relatório...</Text>
              </View>
            ) : (
              <>
                {reportData.items.length > 0 ? (
                  reportData.items.map((item, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                      <Text style={{
                        fontSize: 14,
                        color: '#666',
                        lineHeight: 22,
                        textAlign: 'justify'
                      }}>
                        {item}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{
                    fontSize: 14,
                    color: '#999',
                    textAlign: 'center',
                    marginTop: 50
                  }}>
                    Clique no botão abaixo para gerar seu relatório
                  </Text>
                )}
              </>
            )}

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleReceiveReport}
              disabled={loading || !userUid}
              style={{
                backgroundColor: loading || !userUid ? '#ccc' : AppTheme.colors.primary,
                paddingVertical: 15,
                paddingHorizontal: 30,
                borderRadius: 25,
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 30
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600'
              }}>
                {loading ? 'Gerando...' : 'Receber Relatório'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

      </View>
    </PaperProvider>
  );
}