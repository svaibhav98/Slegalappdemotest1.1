import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkOnboardingStatus = async () => {
      try {
        // Small delay to ensure router is mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) return;

        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        // Show splash for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!mounted) return;

        if (hasSeenOnboarding === 'true') {
          router.replace('/auth/login');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        if (mounted) {
          router.replace('/onboarding');
        }
      }
    };

    checkOnboardingStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <Image 
        source={require('../assets/splash.jpg')} 
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
