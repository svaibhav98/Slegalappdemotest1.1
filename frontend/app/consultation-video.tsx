import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerById, updateBookingStatus, Lawyer } from '../services/lawyersData';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
};

export default function ConsultationVideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookingId, lawyerId } = params;
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      <ImageBackground 
        source={{ uri: lawyer.image }} 
        style={styles.container}
        resizeMode="cover"
      >
        {/* Dark overlay */}
        <View style={styles.overlay} />
        
        {/* Back Button - Fixed at top */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Top Info */}
        <View style={styles.topInfo}>
          <View style={styles.callStatusContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
          </View>
          <Text style={styles.lawyerNameTop}>{lawyer.name}</Text>
          <Text style={styles.practiceAreaTop}>{lawyer.practiceArea}</Text>
        </View>

        {/* Local Video (User) - Small PiP */}
        <View style={styles.localVideo}>
          {isVideoOff ? (
            <View style={styles.videoOff}>
              <Ionicons name="videocam-off" size={24} color={COLORS.white} />
            </View>
          ) : (
            <View style={styles.localVideoPlaceholder}>
              <Ionicons name="person" size={32} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]} 
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <Ionicons name={isVideoOff ? 'videocam-off' : 'videocam'} size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.endCallButton} 
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={28} color={COLORS.white} style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => router.push({ pathname: '/consultation-chat', params: { bookingId, lawyerId } })}
          >
            <Ionicons name="chatbubble" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <Ionicons name="camera-reverse" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  topInfo: {
    position: 'absolute',
    top: 60,
    left: 80,
    zIndex: 50,
  },
  callStatusContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    alignSelf: 'flex-start',
  },
  liveDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: COLORS.success, 
    marginRight: 8,
  },
  durationText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.white,
  },
  lawyerNameTop: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: COLORS.white,
    marginTop: 12,
  },
  practiceAreaTop: { 
    fontSize: 14, 
    color: COLORS.white, 
    opacity: 0.8, 
    marginTop: 4,
  },
  localVideo: { 
    position: 'absolute', 
    top: 150, 
    right: 20, 
    width: 100, 
    height: 140, 
    borderRadius: 12, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: COLORS.white,
    zIndex: 50,
  },
  localVideoPlaceholder: { 
    flex: 1, 
    backgroundColor: '#374151', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  videoOff: { 
    flex: 1, 
    backgroundColor: '#1F2937', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  bottomControls: { 
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 100,
  },
  controlButton: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginHorizontal: 6,
  },
  controlButtonActive: { 
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  endCallButton: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: COLORS.error, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginHorizontal: 10,
  },
});
