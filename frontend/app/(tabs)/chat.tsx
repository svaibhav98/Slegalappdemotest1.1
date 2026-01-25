import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NyayAIIcon, LegalDocumentIcon, LawBookIcon, ShieldVerifyIcon } from '../../components/icons/LegalIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Design System Colors matching the Figma design
const COLORS = {
  gradientStart: '#FFB88C',
  gradientEnd: '#FFECD2',
  headerBg: '#2B2D42',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  inputBg: '#F5F5F5',
  inputBorder: '#E5E7EB',
  purple: '#7B2CBF',
  orange: '#FF9933',
  teal: '#00B8A9',
  success: '#10B981',
};

export default function NyayAILandingScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Show disclaimer only on first landing
  useEffect(() => {
    const checkDisclaimerShown = async () => {
      const disclaimerShown = await AsyncStorage.getItem('nyayai_disclaimer_shown_session');
      if (disclaimerShown !== 'true') {
        setShowDisclaimer(true);
        await AsyncStorage.setItem('nyayai_disclaimer_shown_session', 'true');
      }
    };
    checkDisclaimerShown();
  }, []);

  const suggestedPrompts = [
    {
      id: 'notice',
      text: 'Need help drafting a notice?',
      icon: 'document-text',
      color: COLORS.orange,
    },
    {
      id: 'land',
      text: 'What should I do in a land dispute?',
      icon: 'home',
      color: COLORS.teal,
    },
    {
      id: 'tenant',
      text: 'What are my tenant rights?',
      icon: 'key',
      color: COLORS.purple,
    },
    {
      id: 'rti',
      text: 'How to file an RTI application?',
      icon: 'document',
      color: COLORS.success,
    },
  ];

  const handlePromptPress = (prompt: typeof suggestedPrompts[0]) => {
    // Navigate to chat screen with the prompt as first message
    router.push({
      pathname: '/nyayai-chat',
      params: { initialMessage: prompt.text }
    });
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Hide disclaimer permanently when user sends first message
    setShowDisclaimer(false);
    
    // Navigate to chat screen with the typed message
    router.push({
      pathname: '/nyayai-chat',
      params: { initialMessage: inputText.trim() }
    });
  };

  const handlePromptPressWithDisclaimer = (prompt: typeof suggestedPrompts[0]) => {
    // Hide disclaimer when user taps a prompt
    setShowDisclaimer(false);
    handlePromptPress(prompt);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.gradientStart} />
      
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <View style={styles.headerLogoRow}>
                <Image 
                  source={require('../../assets/logo-transparent.png')} 
                  style={styles.headerLogo} 
                  resizeMode="contain"
                />
                <Text style={styles.headerTitle}>Nyay-AI</Text>
              </View>
              <Text style={styles.headerSubtitle}>Legal Assistant</Text>
            </View>
            
            <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.headerBg} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Compact AI Legal Assistant Icon */}
            <View style={styles.mascotContainer}>
              <View style={styles.professionalIconWrapper}>
                {/* Outer Glow Circle */}
                <View style={styles.outerGlow}>
                  {/* Middle Circle */}
                  <View style={styles.middleCircle}>
                    {/* NyayAI Icon - Reduced size */}
                    <NyayAIIcon size={44} color="#FF9933" secondaryColor="#059669" />
                  </View>
                </View>
                {/* Decorative Elements - smaller */}
                <View style={[styles.decorativeCircle, { top: 4, left: 8 }]}>
                  <LawBookIcon size={14} color="#059669" />
                </View>
                <View style={[styles.decorativeCircle, { top: 8, right: 10 }]}>
                  <ShieldVerifyIcon size={14} color="#FF9933" />
                </View>
                <View style={[styles.decorativeCircle, { bottom: 12, left: 12 }]}>
                  <LegalDocumentIcon size={14} color="#059669" />
                </View>
                <View style={[styles.decorativeCircle, { bottom: 8, right: 6 }]}>
                  <NyayAIIcon size={14} color="#FF9933" secondaryColor="#059669" />
                </View>
              </View>
            </View>

            {/* Greeting Text - Compact */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingTitle}>Hello, I'm NyayAI</Text>
              <Text style={styles.greetingSubtitle}>Your Legal Assistant</Text>
              <Text style={styles.greetingDescription}>
                Ask me anything about laws, rights, or government schemes
              </Text>
            </View>

            {/* Suggested Prompts - Compact cards */}
            <View style={styles.promptsContainer}>
              {suggestedPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt.id}
                  style={styles.promptButton}
                  onPress={() => handlePromptPressWithDisclaimer(prompt)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.promptDot, { backgroundColor: prompt.color }]} />
                  <Text style={styles.promptText} numberOfLines={2} ellipsizeMode="tail">{prompt.text}</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Disclaimer - Only shown on first landing */}
            {showDisclaimer && (
              <Text style={styles.disclaimer}>
                <Text style={styles.disclaimerBold}>Disclaimer:</Text> NyayAI provides general legal information. For specific legal advice, please consult a qualified lawyer.
              </Text>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcons}>
                <TouchableOpacity style={styles.inputIcon}>
                  <Ionicons name="sparkles" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIcon}>
                  <Ionicons name="attach" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIcon}>
                  <Ionicons name="mic-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Ask NyayAI anything..."
                placeholderTextColor={COLORS.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  
  // Header - Compact to match other screens
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logoSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 0,
  },
  headerLogo: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  // Mascot - Compact
  mascotContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  professionalIconWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FF9933',
  },
  shieldContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  // Greeting - Compact
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: 26,
  },
  greetingSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  greetingDescription: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // Prompts - Compact cards
  promptsContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  promptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  promptText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  disclaimer: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  disclaimerBold: {
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  inputIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  inputIcon: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 80,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
