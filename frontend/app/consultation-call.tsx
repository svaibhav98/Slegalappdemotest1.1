import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerById, updateBookingStatus, Lawyer } from '../services/lawyersData';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  textPrimary: '#1A1A2E',
};

export default function ConsultationCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookingId, lawyerId } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) setLawyer(lawyerData);
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lawyerId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Direct navigation - no alerts
  const handleEndCall = () => {
    updateBookingStatus(bookingId as string, 'completed');
    router.replace({
      pathname: '/post-consultation',
      params: { bookingId, lawyerId }
    });
  };

  const handleBack = () => {
    updateBookingStatus(bookingId as string, 'completed');
    router.replace('/(tabs)/home');
  };

  if (!lawyer) {
    return (
      <LinearGradient colors={['#1A1A2E', '#2D3748']} style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#1A1A2E', '#2D3748']} style={styles.container}>
        {/* Back Button - Fixed at top */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Call Info */}
        <View style={styles.callInfo}>
          <View style={styles.profileContainer}>
            <Image source={{ uri: lawyer.image }} style={styles.profileImage} />
          </View>
          <Text style={styles.lawyerName}>{lawyer.name}</Text>
          <Text style={styles.practiceArea}>{lawyer.practiceArea}</Text>
          <View style={styles.durationContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={28} color={COLORS.white} />
            <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]} 
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <Ionicons name={isSpeakerOn ? 'volume-high' : 'volume-medium'} size={28} color={COLORS.white} />
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => router.push({ pathname: '/consultation-chat', params: { bookingId, lawyerId } })}
          >
            <Ionicons name="chatbubble" size={28} color={COLORS.white} />
            <Text style={styles.controlLabel}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity 
          style={styles.endCallButton} 
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={32} color={COLORS.white} style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.endCallLabel}>End Call</Text>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  callInfo: { 
    alignItems: 'center',
    marginTop: 40,
  },
  profileContainer: { 
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: COLORS.success,
    overflow: 'hidden',
  },
  profileImage: { 
    width: '100%', 
    height: '100%',
    backgroundColor: '#374151',
  },
  lawyerName: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: COLORS.white, 
    marginTop: 24,
  },
  practiceArea: { 
    fontSize: 16, 
    color: COLORS.white, 
    opacity: 0.7, 
    marginTop: 4,
  },
  durationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20,
  },
  liveDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: COLORS.success, 
    marginRight: 10,
  },
  durationText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.white,
  },
  controlsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center',
  },
  controlButton: { 
    alignItems: 'center', 
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  controlButtonActive: { 
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  controlLabel: { 
    fontSize: 12, 
    color: COLORS.white, 
    opacity: 0.8, 
    marginTop: 8,
  },
  endCallButton: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: COLORS.error, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  endCallLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 10,
  },
});
