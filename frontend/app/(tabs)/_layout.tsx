import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.gray400, tabBarStyle: { backgroundColor: Colors.background, borderTopColor: Colors.border, borderTopWidth: 1, height: 60, paddingBottom: 8, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 12, fontWeight: '600' } }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="laws" options={{ title: 'Laws', tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'NyayAI', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} /> }} />
      <Tabs.Screen name="cases" options={{ title: 'Cases', tabBarIcon: ({ color, size }) => <Ionicons name="folder" size={size} color={color} /> }} />
      <Tabs.Screen name="documents" options={{ title: 'Documents', tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} /> }} />
    </Tabs>
  );
}
