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
  Modal,
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
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  
  // ChatGPT-style drawer state
  const [showDrawer, setShowDrawer] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{id: string, title: string, date: string}>>([]);

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
            
            <View style={styles.headerActions}>
              {/* Eye Icon - Focus Mode Toggle */}
              <TouchableOpacity 
                style={styles.headerIconButton} 
                onPress={() => setFocusMode(!focusMode)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={focusMode ? "eye-off" : "eye"} 
                  size={22} 
                  color={focusMode ? COLORS.orange : COLORS.headerBg} 
                />
              </TouchableOpacity>
              
              {/* Three-dot Menu */}
              <TouchableOpacity 
                style={styles.headerIconButton} 
                onPress={() => setShowMenu(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="ellipsis-vertical" size={22} color={COLORS.headerBg} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!focusMode && (
              <>
                {/* Compact AI Legal Assistant Icon */}
                <View style={styles.mascotContainer}>
                  <View style={styles.professionalIconWrapper}>
                    {/* Outer Glow Circle */}
                    <View style={styles.outerGlow}>
                      {/* Middle Circle */}
                      <View style={styles.middleCircle}>
                        {/* NyayAI Icon - Using larger size for hero display */}
                        <NyayAIIcon size={48} color="#FF9933" secondaryColor="#059669" />
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
                      <NyayAIIcon size={16} color="#FF9933" secondaryColor="#059669" />
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
              </>
            )}
            
            {focusMode && (
              <View style={styles.focusModeContainer}>
                <Text style={styles.focusModeText}>Focus Mode Active</Text>
                <Text style={styles.focusModeSubtext}>Ask your legal question below</Text>
              </View>
            )}
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
      
      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Options</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setInputText('');
                setFocusMode(false);
                setShowDisclaimer(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>New Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowDisclaimerModal(true);
              }}
            >
              <Ionicons name="information-circle-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>View Disclaimer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowReportModal(true);
              }}
            >
              <Ionicons name="flag-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>Report an Issue</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclaimerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Legal Disclaimer</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                SunoLegal / NyayAI is an informational platform and not a law firm. We do not provide legal advice. 
                {'\n\n'}
                Any guidance provided is general information for awareness purposes only. For specific legal advice tailored to your situation, please consult a qualified advocate or legal professional.
                {'\n\n'}
                The information provided through NyayAI should not be relied upon as a substitute for professional legal counsel.
              </Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowDisclaimerModal(false)}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Report Issue Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report an Issue</Text>
            <Text style={styles.modalSubtitle}>Select the type of issue:</Text>
            
            {['Incorrect information', 'Technical problem', 'Inappropriate content'].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reportOption,
                  selectedReportReason === reason && styles.reportOptionSelected
                ]}
                onPress={() => setSelectedReportReason(reason)}
              >
                <View style={[
                  styles.reportRadio,
                  selectedReportReason === reason && styles.reportRadioSelected
                ]}>
                  {selectedReportReason === reason && <View style={styles.reportRadioInner} />}
                </View>
                <Text style={styles.reportOptionText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  !selectedReportReason && styles.modalButtonDisabled
                ]}
                disabled={!selectedReportReason}
                onPress={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                  // Handle report submission
                }}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 10,
    color: COLORS.textMuted,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingTop: 4,
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
  
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  
  // Focus Mode
  focusModeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  focusModeText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  focusModeSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // Menu Modal
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  // Disclaimer & Report Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  
  // Report Options
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  reportOptionSelected: {
    borderColor: COLORS.orange,
    backgroundColor: '#FFF7ED',
  },
  reportOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  reportRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportRadioSelected: {
    borderColor: COLORS.orange,
  },
  reportRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.orange,
  },
});
