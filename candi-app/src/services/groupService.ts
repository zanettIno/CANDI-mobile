/**
 * Group Service
 *
 * API integration for group management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
import { getValidAccessToken } from './authService';

export interface Group {
  group_id: string;
  group_name: string;
  description?: string;
  created_by: string;
  created_at: string;
  member_count: number;
  is_public: boolean;
}

/**
 * Helper para fazer requisições autenticadas a grupos
 */
const fetchGroupAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getValidAccessToken();

  const defaultHeaders: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro na requisição de grupos');
  }

  return response.json();
};

/**
 * Create a new group
 */
export const createGroup = async (
  groupName: string,
  description?: string,
): Promise<Group> => {
  const endpoint = '/groups';

  const response = await fetchGroupAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      group_name: groupName,
      description,
    }),
  });

  return response.group;
};

/**
 * Get all public groups
 */
export const getGroups = async (): Promise<Group[]> => {
  const endpoint = '/groups';

  const response = await fetchGroupAPI(endpoint);

  return response.groups || [];
};

/**
 * Get user's joined groups
 */
export const getUserGroups = async (): Promise<Group[]> => {
  const endpoint = '/groups/my-groups';

  const response = await fetchGroupAPI(endpoint);

  return response.groups || [];
};

/**
 * Get group by ID
 */
export const getGroupById = async (groupId: string): Promise<Group> => {
  const endpoint = `/groups/${groupId}`;

  const response = await fetchGroupAPI(endpoint);

  return response.group;
};

/**
 * Join a group
 */
export const joinGroup = async (groupId: string): Promise<void> => {
  const endpoint = `/groups/${groupId}/join`;

  await fetchGroupAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

/**
 * Leave a group
 */
export const leaveGroup = async (groupId: string): Promise<void> => {
  const endpoint = `/groups/${groupId}/leave`;

  await fetchGroupAPI(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Check if user is member of group
 */
export const checkMembership = async (groupId: string): Promise<boolean> => {
  const endpoint = `/groups/${groupId}/is-member`;

  const response = await fetchGroupAPI(endpoint);

  return response.is_member || false;
};

/**
 * Get posts for a specific group
 */
export const getGroupPosts = async (groupId: string) => {
  const endpoint = `/feed/groups/${groupId}/posts`;

  const response = await fetchGroupAPI(endpoint);

  return response.posts || [];
};
