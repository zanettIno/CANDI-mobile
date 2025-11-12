import React, { useState } from 'react';
import { View, Text, FlatList, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppTheme } from '../../../../theme/index';
import HomeBackground from '@/components/HomeBackground';
import SearchInput from '@/components/Inputs/inputSearch';
import GroupCard from '@/components/Card/groupCard';
import GroupAdd from '@/components/Modals/GroupAddModal'; 

const MOCK_GROUPS = [
  { id: '1', groupName: "Grupo de Apoio - Câncer de Mama", groupDescription: 'Um espaço seguro para compartilhar experiências e informações sobre o tratamento de câncer de mama.' },
  { id: '2', groupName: 'Dieta e Nutrição Oncológica', groupDescription: 'Dicas e receitas para manter uma alimentação saudável durante e após o tratamento.' },
  { id: '3', groupName: 'Exercícios e Bem-Estar', groupDescription: 'Discussões sobre atividades físicas leves e práticas de bem-estar para pacientes oncológicos.' },
  { id: '4', groupName: 'Novos Tratamentos e Pesquisas', groupDescription: 'Compartilhamento de artigos e notícias sobre os avanços mais recentes na oncologia.' },
];

const ScreenContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${AppTheme.colors.background};
`;

const HeaderContainer = styled(View)`
  padding: 0 16px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const TitleText = styled(Text)`
  font-size: ${AppTheme.fonts.titleLarge.fontSize}px;
  font-family: ${AppTheme.fonts.titleLarge.fontFamily};
  font-weight: ${AppTheme.fonts.titleLarge.fontWeight};
  color: ${AppTheme.colors.textColor};
`;

const AddButton = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
`;

const GroupsCountText = styled(Text)`
  font-size: ${AppTheme.fonts.bodyMedium.fontSize}px;
  font-family: ${AppTheme.fonts.bodyMedium.fontFamily};
  font-weight: ${AppTheme.fonts.bodyMedium.fontWeight};
  color: ${AppTheme.colors.textColor};
  margin-top: 12px;
  margin-left: 20px;
  margin-bottom: 16px;
`;

const ListContainer = styled(View)`
  flex: 1;
  background-color: ${AppTheme.colors.cardBackground};
`;

export const GroupView: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); 

  const totalGroups = MOCK_GROUPS.length;

  const filteredGroups = MOCK_GROUPS.filter(group =>
    group.groupName.toLowerCase().includes(searchText.toLowerCase()) ||
    group.groupDescription.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddGroup = () => {
    setIsModalVisible(true); 
  };

  const handleDismissModal = () => {
    setIsModalVisible(false); 
  };

  const handleJoinGroup = (groupCode: string) => {
    console.log('Entrar no grupo com código:', groupCode);
    setIsModalVisible(false);
  };

  const handleGroupPress = (groupName: string) => {
    console.log('Abrir grupo:', groupName);
  };

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <HomeBackground>
        <View style={{ flex: 1, marginTop: 160, zIndex: 1 }}>
          <HeaderContainer>
            <TitleText>GRUPOS</TitleText>

            <AddButton onPress={handleAddGroup}>
              <MaterialIcons name="add" size={26} color={AppTheme.colors.textColor} />
            </AddButton>
          </HeaderContainer>

          <View style={{ marginHorizontal: 16, marginTop: 16 }}>
            <SearchInput
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <GroupsCountText>Grupos {totalGroups}</GroupsCountText>

          <ListContainer>
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <GroupCard
                  groupName={item.groupName}
                  groupDescription={item.groupDescription}
                />
              )}
              contentContainerStyle={{
                paddingTop: 8,
                paddingBottom: 12,
              }}
            />
          </ListContainer>
        </View>
      </HomeBackground>

      <GroupAdd
        visible={isModalVisible}
        onDismiss={handleDismissModal}
        onJoinGroup={handleJoinGroup}
      />
    </ScreenContainer>
  );
};

export default GroupView;
