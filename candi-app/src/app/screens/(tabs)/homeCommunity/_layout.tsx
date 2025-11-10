import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function CommunityLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFC4C4',
        tabBarInactiveTintColor: '#CED5D7',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dynamic-feed" color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="groupView"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="group" color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="messagesView"
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="message" color={color} size={30} />
          ),
        }}
      />

      <Tabs.Screen
        name="homeApp"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
}