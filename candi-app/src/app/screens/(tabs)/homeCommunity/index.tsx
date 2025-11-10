import * as React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '@/theme';
import { SearchInput } from '@/components/Inputs/inputSearch';
import PostCard from '@/components/Card/postCard';
import PostCardView from '@/components/Card/postCardView';

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

const BottomNavigation = styled(View)`
  background-color: ${AppTheme.colors.cardBackground};
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  border-top-width: 1px;
  border-top-color: ${AppTheme.colors.dotsColor};
`;

const NavItem = styled(TouchableOpacity) <{ active: boolean }>`
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
`;

const mockPosts = [
  {
    userName: 'Carolina Souza',
    userHandle: 'carolina_souza',
    timeAgo: '9 min',
    content: 'Ao ir no consultório para um exame de retina encontrei uma amiga que passou por todo o processo comigo e não pude deixar de apoiá-la hoje. Passei mais uma hora acompanhando-a pela via-lozinha me partiu o coração. Nós que já passamos por isso o entendemos a dor do outro devemos transmitir força.',
  },
  {
    userName: 'João Silva',
    userHandle: 'joao_silva',
    timeAgo: '2h',
    content: 'Compartilhando minha experiência com o tratamento. Cada dia é uma nova lição de vida e resiliência.',
  },
  {
    userName: 'Maria Santos',
    userHandle: 'maria_santos',
    timeAgo: '4h',
    content: 'Gratidão por ter encontrado essa comunidade. Vocês fazem toda a diferença na minha jornada.',
  },
];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = React.useState('Feed');
  const [searchValue, setSearchValue] = React.useState('');

  const tabs = ['Feed', 'Quimio', 'Câncer', 'Câncer SP', 'Contr...', 'Leuce', 'Diagnóstico', 'Pós-Tratamento', 'Bem-estar'];

  return (
    <PaperProvider theme={AppTheme}>
      <Container>
        {/* Topo */}
        <TopBar>
          <TouchableOpacity>
            <MaterialIcons name="person" size={26} color={AppTheme.colors.tertiary} />
          </TouchableOpacity>

          <Image
            source={require('../../../../../assets/images/original.png')}
            style={{
              width: 120,
              height: 50,
              resizeMode: 'contain',
            }}
          />

          <TouchableOpacity>
            <MaterialIcons name="notifications-none" size={26} color={AppTheme.colors.tertiary} />
          </TouchableOpacity>
        </TopBar>

        {/* Campo de pesquisa */}
        <SearchInputWrapper>
          <SearchInput
            placeholder="Pesquisar"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </SearchInputWrapper>

        {/* Tabs com scroll horizontal e fundo consistente */}
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

        {/* Conteúdo do feed */}
        <ContentContainer>
          <ScrollView showsVerticalScrollIndicator={false}>
            <PostCard />

            {mockPosts.map((post, index) => (
              <PostCardView
                key={index}
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
