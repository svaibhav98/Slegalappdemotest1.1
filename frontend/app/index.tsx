import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // For demo purposes, add a short delay to allow auth state to load
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          // User is logged in, redirect to main app
          router.replace('/(tabs)/home');
        } else {
          // User is not logged in, redirect to login
          router.replace('/auth/login');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
