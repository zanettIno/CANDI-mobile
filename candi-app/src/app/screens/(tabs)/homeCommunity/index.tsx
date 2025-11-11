import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import { SearchInput } from '@/components/Inputs/inputSearch';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';
import { useRouter } from 'expo-router'; 

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

const allPostsData = {
  'Feed': [
    {
      id: 'f1',
      userName: 'Carolina Souza',
      userHandle: 'carolina_souza',
      timeAgo: '9 min',
      content: 'Ao ir no consultório para um exame de retina encontrei uma amiga...',
    },
    {
      id: 'f2',
      userName: 'João Silva',
      userHandle: 'joao_silva',
      timeAgo: '2h',
      content: 'Compartilhando minha experiência com o tratamento. Cada dia é uma nova lição.',
    },
  ],
  'Quimio': [
    {
      id: 'q1',
      userName: 'Equipe Candi',
      userHandle: 'candi_oficial',
      timeAgo: '1h',
      content: 'Dicas importantes para quem está começando a quimioterapia. Beba bastante água!',
    },
  ],
  'Câncer': [
    {
      id: 'c1',
      userName: 'Maria Santos',
      userHandle: 'maria_santos',
      timeAgo: '4h',
      content: 'Gratidão por ter encontrado essa comunidade. Vocês fazem toda a diferença.',
    },
  ],
};

const defaultPosts = [
  {
    id: 'd1',
    userName: 'Sistema',
    userHandle: 'admin',
    timeAgo: 'agora',
    content: 'Ainda não há publicações neste grupo. Seja o primeiro a postar!',
  },
];


export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('Feed');
  const [searchValue, setSearchValue] = React.useState('');
  
  const [displayedPosts, setDisplayedPosts] = React.useState(allPostsData['Feed']);

  const tabs = ['Feed', 'Quimio', 'Câncer', 'Câncer SP', 'Contr...', 'Leuce', 'Diagnóstico', 'Pós-Tratamento', 'Bem-estar'];

  React.useEffect(() => {
    const newPosts = allPostsData[activeTab] || defaultPosts;
    setDisplayedPosts(newPosts);
  }, [activeTab]); 

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
            
            <PostCard />

            {displayedPosts.map((post) => (
              <PostCardView
                key={post.id} 
                userName={post.userName}
                userHandle={post.userHandle}
                timeAgo={post.timeAgo}
                content={post.content}
              />
            ))}
          </ScrollView>
        </ContentContainer>
      </Container>
    </PaperProvider>
  );
}