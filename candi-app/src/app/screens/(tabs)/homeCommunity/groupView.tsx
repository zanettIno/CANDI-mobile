import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { AppTheme } from '@/theme';
import SearchInput from '@/components/Inputs/inputSearch';
import EmptyState from '@/components/EmptyState';
import GroupAddModal from '@/components/Modals/GroupAddModal';
import { listGroups, getMyGroups, joinGroup, createGroup } from '@/services/communityService';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

interface Group {
  group_id: string;
  name: string;
  description: string;
  topic: string;
  member_count: number;
  creator_name: string;
  created_at: string;
}

type Tab = 'todos' | 'meus';

export const GroupView: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('todos');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const [all, mine] = await Promise.all([listGroups(), getMyGroups()]);
      setGroups(all);
      setMyGroupIds(new Set(mine.map((m: any) => m.group_id)));
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível carregar os grupos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadGroups(); }, [loadGroups]));

  const handleJoin = async (groupId: string) => {
    if (myGroupIds.has(groupId)) return;
    setJoiningId(groupId);
    try {
      await joinGroup(groupId);
      setMyGroupIds(prev => new Set([...prev, groupId]));
      Alert.alert('Bem-vindo!', 'Você entrou no grupo com sucesso.');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível entrar no grupo.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateGroup = async (data: { name: string; description: string; topic: string }) => {
    try {
      const newGroup = await createGroup(data);
      setGroups(prev => [newGroup, ...prev]);
      setMyGroupIds(prev => new Set([...prev, newGroup.group_id]));
      Alert.alert('Grupo criado!', `O grupo "${newGroup.name}" foi criado com sucesso.`);
      return newGroup; // necessário para upload de foto após criar
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível criar o grupo.');
      throw err;
    }
  };

  const displayedGroups = groups.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchText.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchText.toLowerCase());

    if (activeTab === 'meus') return matchesSearch && myGroupIds.has(g.group_id);
    return matchesSearch;
  });

  const renderGroup = ({ item }: { item: Group }) => {
    const isMember = myGroupIds.has(item.group_id);
    const isJoining = joiningId === item.group_id;

    return (
      <View style={styles.groupCard}>
        <View style={styles.groupCardTop}>
          {(item as any).photo_url ? (
            <Image source={{ uri: (item as any).photo_url }} style={styles.groupPhoto} />
          ) : (
            <View style={styles.groupIconWrapper}>
              <Text style={styles.groupIcon}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.groupInfo}>
            <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.groupMeta}>
              <MaterialIcons name="people" size={13} color={AppTheme.colors.placeholderText} />
              <Text style={styles.groupMetaText}>{item.member_count || 1} membros</Text>
              <View style={styles.topicBadge}>
                <Text style={styles.topicBadgeText}>{item.topic}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.joinBtn, isMember && styles.joinBtnMember]}
            onPress={() => !isMember && handleJoin(item.group_id)}
            disabled={isMember || !!joiningId}
            activeOpacity={0.8}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color={AppTheme.colors.cardBackground} />
            ) : (
              <Text style={[styles.joinBtnText, isMember && styles.joinBtnTextMember]}>
                {isMember ? 'Membro' : 'Entrar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {item.description ? (
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + 12 }]}>
        <Text style={styles.title}>GRUPOS</Text>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.createBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={24} color={AppTheme.colors.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchInput value={searchText} onChangeText={setSearchText} placeholder="Buscar grupos..." />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['todos', 'meus'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'todos' ? 'Todos os Grupos' : 'Meus Grupos'}
              {tab === 'meus' && myGroupIds.size > 0 ? ` (${myGroupIds.size})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={AppTheme.colors.tertiary} />
        </View>
      ) : (
        <FlatList
          data={displayedGroups}
          keyExtractor={item => item.group_id}
          renderItem={renderGroup}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <EmptyState
              icon="groups"
              title={activeTab === 'meus' ? 'Você não faz parte de nenhum grupo' : 'Nenhum grupo encontrado'}
              subtitle={activeTab === 'meus' ? 'Entre em grupos para se conectar com outros pacientes.' : 'Seja o primeiro a criar um grupo de apoio!'}
              actionLabel={activeTab === 'meus' ? 'Explorar grupos' : 'Criar grupo'}
              onAction={() => activeTab === 'meus' ? setActiveTab('todos') : setIsModalVisible(true)}
            />
          }
        />
      )}

      <GroupAddModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        onCreateGroup={handleCreateGroup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
    position: 'relative',
  },
  title: {
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
    fontSize: AppTheme.fonts.titleLarge.fontSize,
    fontWeight: '700',
    color: AppTheme.colors.textColor,
  },
  createBtn: { position: 'absolute', right: 16, bottom: 12 },
  searchWrapper: {
    padding: 12,
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.dotsColor,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: AppTheme.colors.tertiary },
  tabText: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    color: AppTheme.colors.placeholderText,
    fontWeight: '500',
  },
  tabTextActive: { color: AppTheme.colors.tertiary, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  groupCard: {
    backgroundColor: AppTheme.colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.dotsColor,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  groupCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupPhoto: { width: 48, height: 48, borderRadius: 12 },
  groupIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: AppTheme.colors.tertiary,
    fontFamily: AppTheme.fonts.titleLarge.fontFamily,
  },
  groupInfo: { flex: 1 },
  groupName: {
    fontFamily: AppTheme.fonts.bodyMedium.fontFamily,
    fontSize: AppTheme.fonts.bodyMedium.fontSize,
    fontWeight: '700',
    color: AppTheme.colors.nameText,
    marginBottom: 4,
  },
  groupMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groupMetaText: {
    fontSize: 12,
    color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
  },
  topicBadge: {
    marginLeft: 6,
    backgroundColor: AppTheme.colors.placeholderBackground,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  topicBadgeText: {
    fontSize: 10,
    color: AppTheme.colors.placeholderText,
    fontFamily: AppTheme.fonts.labelSmall.fontFamily,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: AppTheme.colors.tertiary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 60,
    alignItems: 'center',
    minHeight: 34,
    justifyContent: 'center',
  },
  joinBtnMember: { backgroundColor: AppTheme.colors.secondary },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.cardBackground,
    fontFamily: AppTheme.fonts.labelMedium.fontFamily,
  },
  joinBtnTextMember: { color: AppTheme.colors.tertiary },
  groupDescription: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.dotsColor,
    fontFamily: AppTheme.fonts.bodySmall.fontFamily,
    fontSize: AppTheme.fonts.bodySmall.fontSize,
    color: AppTheme.colors.roleText,
    lineHeight: 18,
  },
});

export default GroupView;
