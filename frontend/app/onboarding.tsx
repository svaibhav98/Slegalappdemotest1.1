import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, FlatList, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Clean onboarding images (no embedded UI elements)
const ONBOARDING_SCREENS = [
  {
    id: '1',
    image: { uri: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&q=80' },
    title: 'Access Legal Help',
    subtitle: 'Get instant legal guidance powered by AI',
  },
  {
    id: '2',
    image: { uri: 'https://images.unsplash.com/photo-1590099543482-3b3d3083a474?w=800&q=80' },
    title: 'Know Your Rights',
    subtitle: 'Explore laws, schemes & government benefits',
  },
  {
    id: '3',
    image: { uri: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80' },
    title: 'Connect with Lawyers',
    subtitle: 'Consult verified legal experts anytime',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/auth/login');
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SCREENS.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      handleSkip();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <Image 
        source={item.image} 
        style={styles.image}
        resizeMode="cover"
      />
      {/* Overlay with title and subtitle */}
      <View style={styles.overlay}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#1A1A2E" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Onboarding Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SCREENS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_SCREENS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Get Started / Next Button */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === ONBOARDING_SCREENS.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width: width,
    height: height,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#FF9933',
    width: 24,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  button: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 30,
    marginHorizontal: 40,
    width: width - 80,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
