/**
 * Group View Screen
 *
 * Displays all available groups with:
 * - List of public groups
 * - Search/filter functionality
 * - Create new group button
 * - Join group functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { spacing, colors, typography } from '@/theme/tokens';
import HomeBackground from '@/components/HomeBackground';
import Input from '@/components/Inputs/Input';
import Button from '@/components/Buttons/Button';
import GroupCard from '@/components/Card/groupCard';
import GroupCreateModal from '@/components/Modals/GroupCreateModal';
import * as groupService from '@/services/groupService';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ScreenContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.neutral.light_gray};
`;

const HeaderContainer = styled(View)`
  padding: 0 ${spacing.base}px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: ${spacing.base}px;
`;

const TitleText = styled(Text)`
  font-size: ${typography.sizes.heading_medium}px;
  font-family: ${typography.fonts.heading};
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
`;

const AddButton = styled(TouchableOpacity)`
  position: absolute;
  right: ${spacing.base}px;
  width: 48px;
  height: 48px;
  justify-content: center;
  align-items: center;
  border-radius: 24px;
  background-color: ${colors.primary.rosa_full};
`;

const GroupsCountText = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  font-family: ${typography.fonts.body};
  color: ${colors.text.secondary};
  margin-top: ${spacing.md}px;
  margin-left: ${spacing.lg}px;
  margin-bottom: ${spacing.base}px;
`;

const ListContainer = styled(View)`
  flex: 1;
  background-color: ${colors.neutral.white};
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg}px;
`;

const EmptyText = styled(Text)`
  font-size: ${typography.sizes.body_large}px;
  color: ${colors.text.secondary};
  text-align: center;
`;

// ============================================================================
// COMPONENT
// ============================================================================

export const GroupView: React.FC = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<groupService.Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<groupService.Group[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load groups when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadGroups();
    }, [])
  );

  // Filter groups when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.group_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (group.description?.toLowerCase() || '').includes(searchText.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchText, groups]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const loadedGroups = await groupService.getGroups();
      setGroups(loadedGroups);
      setFilteredGroups(loadedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Erro', 'Não foi possível carregar os grupos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/screens/community/groupDetail/${groupId}`);
  };

  const handleCreateGroup = async (name: string, description?: string) => {
    try {
      await groupService.createGroup(name, description);
      setIsModalVisible(false);
      await loadGroups();
      Alert.alert('Sucesso', 'Grupo criado com sucesso!');
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Erro', 'Não foi possível criar o grupo');
    }
  };

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <HomeBackground>
        <View style={{ flex: 1, marginTop: 160, zIndex: 1 }}>
          {/* Header */}
          <HeaderContainer>
            <TitleText>GRUPOS</TitleText>
            <AddButton
              onPress={() => setIsModalVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Create new group"
            >
              <MaterialIcons name="add" size={24} color={colors.neutral.white} />
            </AddButton>
          </HeaderContainer>

          {/* Search */}
          <View style={{ marginHorizontal: spacing.base }}>
            <Input
              label="Buscar grupos..."
              value={searchText}
              onChangeText={setSearchText}
              icon="search"
            />
          </View>

          {/* Groups count */}
          <GroupsCountText>
            {filteredGroups.length} grupos
          </GroupsCountText>

          {/* Groups list or loading/empty state */}
          <ListContainer>
            {isLoading ? (
              <LoadingContainer>
                <ActivityIndicator size="large" color={colors.primary.rosa_full} />
              </LoadingContainer>
            ) : filteredGroups.length === 0 ? (
              <EmptyContainer>
                <MaterialIcons name="group-off" size={48} color={colors.text.secondary} />
                <EmptyText style={{ marginTop: spacing.base }}>
                  {searchText
                    ? 'Nenhum grupo encontrado'
                    : 'Nenhum grupo disponível. Crie um novo!'}
                </EmptyText>
              </EmptyContainer>
            ) : (
              <FlatList
                data={filteredGroups}
                keyExtractor={item => item.group_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleGroupPress(item.group_id)}
                    activeOpacity={0.7}
                  >
                    <GroupCard
                      groupName={item.group_name}
                      groupDescription={item.description || 'Sem descrição'}
                      memberCount={item.member_count}
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{
                  paddingVertical: spacing.sm,
                  paddingBottom: spacing.xxl,
                }}
              />
            )}
          </ListContainer>
        </View>
      </HomeBackground>

      {/* Create Group Modal */}
      <GroupCreateModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        onCreateGroup={handleCreateGroup}
      />
    </ScreenContainer>
  );
};

export default GroupView;
