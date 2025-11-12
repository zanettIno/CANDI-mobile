// src/app/screens/(tabs)/homeCommunity/index.tsx
import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native'; // 🔹 Adiciona ActivityIndicator, Alert
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import { SearchInput } from '@/components/Inputs/inputSearch';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';
import { useRouter, useFocusEffect } from 'expo-router'; // 🔹 Adiciona useFocusEffect
import { getPosts } from '@/services/feedService'; // 🔹 IMPORTA O SERVIÇO

// Interface para o item de postagem vindo do backend
interface Post {
    post_id: string;
    profile_id: string;
    profile_name: string;
    content: string;
    file_url?: string;
    created_at: string;
    topic: string;
}

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.background};
`;

const TopBar = styled(View)`
  background-color: ${AppTheme.colors.cardBackground};
  padding: 14px 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: ${AppTheme.colors.dotsColor};
`;

const SearchInputWrapper = styled(View)`
  padding: 8px 16px;
  background-color: ${AppTheme.colors.cardBackground};
`;

const ContentContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.background};
`;

const CenteredText = styled(Text)`
  text-align: center;
  color: ${AppTheme.colors.placeholderText};
  margin-top: 50px;
  font-size: 16px;
`;

// 🔹 A lista de abas será a fonte da verdade para o GSI 'topic'
const tabs = ['Feed', 'Quimio', 'Câncer', 'Câncer SP', 'Contr...', 'Leuce', 'Diagnóstico', 'Pós-Tratamento', 'Bem-estar'];


export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('Feed');
  const [searchValue, setSearchValue] = React.useState('');
  
  // 🔹 NOVOS ESTADOS
  const [displayedPosts, setDisplayedPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  // 🔹 FUNÇÃO PARA BUSCAR POSTS
  const fetchPosts = React.useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // O serviço mapeia 'Feed' para o feed global (sem query param)
      const data = await getPosts(topic);
      // Os posts do backend são objetos Post
      setDisplayedPosts(data); 
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar as postagens.');
      setDisplayedPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 EFEITO 1: Recarrega posts sempre que a tela ganha foco (ou a primeira vez)
  useFocusEffect(
    React.useCallback(() => {
      // Recarrega o feed para a aba ativa
      fetchPosts(activeTab); 
    }, [activeTab]) // Depende da aba, mas só carrega se ganhar foco
  );

  // 🔹 EFEITO 2: Garante que, ao mudar a aba, o nome é passado corretamente para o fetch
  React.useEffect(() => {
      fetchPosts(activeTab);
  }, [activeTab]);


  // 🔹 HANDLER APÓS O POST SER CRIADO (para atualizar a lista)
  const handlePostCreated = (newPost: Post) => {
    // Se o post foi criado na aba ativa, adiciona-o ao topo da lista
    if (activeTab === 'Feed' || activeTab.toUpperCase() === newPost.topic) {
        setDisplayedPosts(prev => [newPost, ...prev]);
    }
  };


  const filteredPosts = displayedPosts.filter(
    (post) =>
        post.profile_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        post.content.toLowerCase().includes(searchValue.toLowerCase())
  );


  return (
    <PaperProvider theme={AppTheme}>
      <Container>
        <TopBar>
          <TouchableOpacity onPress={() => router.push('/screens/homeProfile')}> 
            <MaterialIcons name="person" size={26} color={AppTheme.colors.tertiary} />
          </TouchableOpacity>

          <Image
            source={require('../../../../../assets/images/original.png')}
            style={{ width: 120, height: 50, resizeMode: 'contain' }}
          />

          <View style={{ width: 26 }} /> 
        </TopBar>

        <SearchInputWrapper>
          <SearchInput
            placeholder="Pesquisar"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </SearchInputWrapper>

        <View
          style={{
            backgroundColor: AppTheme.colors.cardBackground,
            borderBottomWidth: 1,
            borderBottomColor: AppTheme.colors.dotsColor,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)} 
                style={{
                  paddingVertical: 12,
                  marginRight: 24,
                  borderBottomWidth: activeTab === tab ? 3 : 0,
                  borderBottomColor:
                    activeTab === tab ? AppTheme.colors.tertiary : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
                    fontSize: AppTheme.fonts.bodyMedium.fontSize,
                    fontWeight: '500',
                    color:
                      activeTab === tab
                        ? AppTheme.colors.tertiary
                        : AppTheme.colors.placeholderText,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ContentContainer>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* 🔹 PASSA O HANDLER E O TÓPICO ATIVO PARA O POSTCARD */}
            <PostCard 
                activeTopic={activeTab} 
                onPostSuccess={handlePostCreated}
            />

            {isLoading ? (
                <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ marginTop: 50 }} />
            ) : error ? (
                <CenteredText style={{color: 'red'}}>{error}</CenteredText>
            ) : filteredPosts.length === 0 ? (
                <CenteredText>
                    Nenhuma postagem encontrada nesta categoria.
                </CenteredText>
            ) : (
                filteredPosts.map((post) => (
                    <PostCardView
                        key={post.post_id} 
                        userName={post.profile_name}
                        userHandle={post.profile_id.substring(0, 8)} // Usa o início do ID como handle
                        timeAgo={new Date(post.created_at).toLocaleDateString('pt-BR')} // Melhore a formatação de data depois
                        content={post.content}
                        // fileUrl={post.file_url} // Se você quiser exibir imagens
                    />
                ))
            )}
          </ScrollView>
        </ContentContainer>
      </Container>
    </PaperProvider>
  );
}