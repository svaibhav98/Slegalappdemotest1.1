import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    
    // Navigate to chat screen with the typed message
    router.push({
      pathname: '/nyayai-chat',
      params: { initialMessage: inputText.trim() }
    });
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
            {/* Professional AI Legal Assistant Icon */}
            <View style={styles.mascotContainer}>
              <View style={styles.professionalIconWrapper}>
                {/* Outer Glow Circle */}
                <View style={styles.outerGlow}>
                  {/* Middle Circle */}
                  <View style={styles.middleCircle}>
                    {/* AI Shield Icon */}
                    <View style={styles.shieldContainer}>
                      <Ionicons name="shield-checkmark" size={60} color="#FF9933" />
                    </View>
                  </View>
                </View>
                {/* Decorative Elements */}
                <View style={[styles.decorativeCircle, { top: 10, left: 10 }]}>
                  <Ionicons name="book" size={16} color="#059669" />
                </View>
                <View style={[styles.decorativeCircle, { top: 15, right: 15 }]}>
                  <Ionicons name="scale" size={16} color="#FF9933" />
                </View>
                <View style={[styles.decorativeCircle, { bottom: 20, left: 20 }]}>
                  <Ionicons name="document-text" size={16} color="#059669" />
                </View>
                <View style={[styles.decorativeCircle, { bottom: 15, right: 10 }]}>
                  <Ionicons name="sparkles" size={16} color="#FF9933" />
                </View>
              </View>
            </View>

            {/* Greeting Text */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingTitle}>Hello, I'm NyayAI</Text>
              <Text style={styles.greetingSubtitle}>Your Legal Assistant..</Text>
              <Text style={styles.greetingDescription}>
                Ask me anything about laws, rights, or government schemes
              </Text>
            </View>

            {/* Suggested Prompts */}
            <View style={styles.promptsContainer}>
              {suggestedPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt.id}
                  style={styles.promptButton}
                  onPress={() => handlePromptPress(prompt)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.promptDot, { backgroundColor: prompt.color }]} />
                  <Text style={styles.promptText}>{prompt.text}</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              <Text style={styles.disclaimerBold}>Disclaimer:</Text> NyayAI provides general legal information. For specific legal advice, please consult a qualified lawyer.
            </Text>

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
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    gap: 8,
    marginBottom: 2,
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
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

  // Mascot
  mascotContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  professionalIconWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FF9933',
  },
  shieldContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  // Greeting
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  greetingDescription: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Prompts
  promptsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  promptDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  disclaimer: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
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
