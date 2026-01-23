import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getLawyerById, updateBookingStatus, Lawyer } from '../services/lawyersData';

const COLORS = {
  primary: '#FF9933',
  white: '#FFFFFF',
  background: '#FFF8F0',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  userBubble: '#FFFFFF',
  lawyerBubble: '#2D3748',
  success: '#10B981',
  teal: '#14B8A6',
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lawyer';
  timestamp: string;
  showActions?: boolean;
}

export default function ConsultationChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookingId, lawyerId } = params;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId as string);
    if (lawyerData) {
      setLawyer(lawyerData);
      // Sample conversation matching the design
      setMessages([
        {
          id: '1',
          text: 'Hello Ma\'am, I need help filing a Divorce Petition',
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          text: 'Please share marriage details and grounds to draft a petition for you',
          sender: 'lawyer',
          timestamp: new Date().toISOString(),
          showActions: true,
        },
        {
          id: '3',
          text: 'I was married in 2016 and have been living separately for the last 2 years. The main issue is cruelty and lack of mutual understanding.',
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
        {
          id: '4',
          text: 'Thank you for sharing. Based on your details, you may file a divorce petition under Section 13(1)(ia) of the Hindu Marriage Act (for cruelty) or seek mutual consent divorce under Section 13B, if both parties agree.\n\n\ud83d\udc49 Would you like me to:\n\n1. Draft a sample divorce petition for you, or\n2. Connect you with a family law lawyer to review your case?',
          sender: 'lawyer',
          timestamp: new Date().toISOString(),
          showActions: true,
        },
      ]);
    }
  }, [lawyerId]);

  const handleSend = () => {
    if (!inputText.trim() || !sessionActive) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Simulate lawyer response
    setTimeout(() => {
      const responses = [
        'I understand your concern. Could you provide more details about the timeline of events?',
        'Based on what you\'ve shared, I would recommend the following approach...',
        'This is a common situation under Indian family law. Let me explain the legal provisions that apply here.',
        'You have several options available. Let me walk you through each one.',
        'I\'ll need some additional documentation to give you precise advice. Do you have the marriage certificate?',
      ];
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'lawyer',
        timestamp: new Date().toISOString(),
        showActions: true,
      };
      setMessages(prev => [...prev, response]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1500);
    
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this consultation session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Session', style: 'destructive', onPress: () => {
          setSessionActive(false);
          updateBookingStatus(bookingId as string, 'completed');
          router.replace({
            pathname: '/post-consultation',
            params: { bookingId, lawyerId }
          });
        }}
      ]
    );
  };

  const handleConsultLawyer = () => {
    router.push('/lawyers');
  };

  const handleBookCall = () => {
    if (lawyer) {
      router.push({
        pathname: '/booking-summary',
        params: {
          lawyerId: lawyer.id,
          packageId: lawyer.packages[0].id, // Voice call package
          mode: 'instant'
        }
      });
    }
  };

  const handleVoiceCall = () => {
    if (lawyer) {
      router.push({
        pathname: '/consultation-call',
        params: { bookingId, lawyerId }
      });
    }
  };

  const handleVideoCall = () => {
    if (lawyer) {
      router.push({
        pathname: '/consultation-video',
        params: { bookingId, lawyerId }
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.');

  if (!lawyer) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <LinearGradient 
          colors={['#FFECD2', '#FCB69F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              {/* Robot Avatar */}
              <View style={styles.robotAvatar}>
                <View style={styles.robotHead}>
                  <View style={styles.robotEye} />
                  <View style={styles.robotEye} />
                </View>
              </View>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Divorce Petition Chat</Text>
                <Text style={styles.headerSubtitle}>Last Update: {today}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages */}
        <LinearGradient 
          colors={['#FCB69F', '#FFECD2', '#FFF8F0']}
          style={styles.messagesGradient}
        >
          <ScrollView 
            ref={scrollViewRef} 
            style={styles.messagesContainer} 
            contentContainerStyle={styles.messagesContent} 
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View key={message.id}>
                <View style={[styles.messageRow, message.sender === 'user' ? styles.userRow : styles.lawyerRow]}>
                  {message.sender === 'lawyer' && (
                    <View style={styles.lawyerAvatarSmall}>
                      <View style={styles.robotHeadSmall}>
                        <View style={styles.robotEyeSmall} />
                        <View style={styles.robotEyeSmall} />
                      </View>
                    </View>
                  )}
                  <View style={[styles.messageBubble, message.sender === 'user' ? styles.userBubble : styles.lawyerBubble]}>
                    <Text style={[styles.messageText, message.sender === 'user' ? styles.userText : styles.lawyerText]}>
                      {message.text}
                    </Text>
                  </View>
                  {message.sender === 'user' && (
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }} 
                      style={styles.userAvatarSmall}
                    />
                  )}
                </View>
                
                {/* Action Links after lawyer messages */}
                {message.sender === 'lawyer' && message.showActions && (
                  <View style={styles.actionLinksContainer}>
                    <Text style={styles.nyayaiLabel}>NyayAI responded </Text>
                    <TouchableOpacity onPress={handleConsultLawyer}>
                      <Text style={styles.actionLink}>Consult a Lawyer</Text>
                    </TouchableOpacity>
                    <Text style={styles.orText}> or </Text>
                    <TouchableOpacity onPress={handleBookCall}>
                      <Text style={styles.actionLink}>Book a Call</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        </LinearGradient>

        {/* Input */}
        {sessionActive ? (
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputIconButton}>
              <Ionicons name="sparkles-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.inputIconButton}>
              <Ionicons name="attach" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.inputIconButton}>
              <Ionicons name="mic" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type your question to NyayAI."
                placeholderTextColor={COLORS.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={handleSend} 
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sessionEndedBar}>
            <Text style={styles.sessionEndedText}>Session ended</Text>
          </View>
        )}

        {/* Call/Video Buttons - Floating */}
        {sessionActive && (
          <View style={styles.floatingActions}>
            <TouchableOpacity style={styles.callFloatingButton} onPress={handleVoiceCall}>
              <Ionicons name="call" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.videoFloatingButton} onPress={handleVideoCall}>
              <Ionicons name="videocam" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  
  // Header
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 16,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  robotAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  robotHead: {
    width: 32,
    height: 24,
    backgroundColor: '#6B7280',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  robotEye: {
    width: 8,
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },

  // Messages
  messagesGradient: {
    flex: 1,
  },
  messagesContainer: { 
    flex: 1,
  },
  messagesContent: { 
    padding: 16,
  },
  messageRow: { 
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userRow: { 
    justifyContent: 'flex-end',
  },
  lawyerRow: { 
    justifyContent: 'flex-start',
  },
  lawyerAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  robotHeadSmall: {
    width: 24,
    height: 18,
    backgroundColor: '#6B7280',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  robotEyeSmall: {
    width: 5,
    height: 5,
    backgroundColor: '#3B82F6',
    borderRadius: 2.5,
  },
  userAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
  },
  messageBubble: { 
    maxWidth: '70%', 
    borderRadius: 18, 
    padding: 14,
  },
  userBubble: { 
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lawyerBubble: { 
    backgroundColor: COLORS.lawyerBubble,
    borderBottomLeftRadius: 6,
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textPrimary,
  },
  lawyerText: {
    color: COLORS.white,
  },

  // Action Links
  actionLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginLeft: 44,
    marginBottom: 12,
    marginTop: 4,
  },
  nyayaiLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  actionLink: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  orText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },

  // Input
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputIconButton: {
    padding: 8,
  },
  inputWrapper: { 
    flex: 1, 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    marginHorizontal: 8,
  },
  input: { 
    fontSize: 14, 
    color: COLORS.textPrimary, 
    maxHeight: 80,
  },
  sendButton: { 
    padding: 10,
  },
  sendButtonDisabled: { 
    opacity: 0.5,
  },
  sessionEndedBar: { 
    padding: 16, 
    backgroundColor: '#FEE2E2', 
    alignItems: 'center',
  },
  sessionEndedText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#EF4444',
  },

  // Floating Actions
  floatingActions: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    gap: 12,
  },
  callFloatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  videoFloatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
