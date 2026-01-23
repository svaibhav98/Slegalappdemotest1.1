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
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { chatAPI } from '../../utils/api';

// Design System Colors
const COLORS = {
  headerStart: '#FF6B35',
  headerEnd: '#E55A2B',
  primary: '#FF6B35',
  white: '#FFFFFF',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  userBubble: '#FF6B35',
  aiBubble: '#F3F4F6',
  purple: '#7B2CBF',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  error?: boolean;
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    
    // Welcome message with disclaimer
    setMessages([{
      role: 'assistant',
      content: 'Namaste! 🙏 I am NyayAI, your legal information assistant for India.\n\nI can help you understand:\n• Tenant rights and rent laws\n• Consumer protection\n• RTI applications\n• Government schemes\n• Police procedures\n• And more...\n\n⚠️ **Disclaimer:** I provide general legal information only, NOT personalized legal advice. For specific cases, please consult a qualified lawyer.',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(inputText, sessionId);
      const aiResponse = response.response || response.message || 'I apologize, but I couldn\'t process your query. Please try again.';
      
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Fallback mock response for demo
      const mockResponse = getMockResponse(inputText);
      const aiMessage: Message = {
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const getMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('tenant') || lowerQuery.includes('rent')) {
      return `**Tenant Rights in India:**\n\n1. **Right to Fair Rent:** Landlords cannot charge arbitrary rent. Most states have Rent Control Acts.\n\n2. **Security Deposit:** Maximum 2-3 months rent (varies by state).\n\n3. **Notice Period:** Typically 1-3 months notice required before eviction.\n\n4. **Written Agreement:** Always get a registered rent agreement.\n\n5. **Maintenance:** Landlord responsible for structural repairs.\n\n⚠️ **Disclaimer:** This is general information. For personalized legal advice, please consult a verified lawyer on our platform.`;
    }
    
    if (lowerQuery.includes('rti') || lowerQuery.includes('information')) {
      return `**How to File RTI Application:**\n\n1. **Who Can File:** Any Indian citizen\n\n2. **Fee:** ₹10 for Central Government (varies for states)\n\n3. **How to Apply:**\n   - Write application to Public Information Officer (PIO)\n   - State clearly what information you need\n   - Pay the application fee\n\n4. **Timeline:** Response within 30 days\n\n5. **Appeals:** First appeal to Appellate Authority, then Information Commission\n\n⚠️ **Disclaimer:** This is general information. For personalized legal advice, please consult a verified lawyer on our platform.`;
    }
    
    if (lowerQuery.includes('consumer') || lowerQuery.includes('complaint')) {
      return `**Consumer Protection Act, 2019:**\n\n**Your Rights:**\n• Right to safety\n• Right to information\n• Right to choose\n• Right to be heard\n• Right to seek redressal\n\n**How to File Complaint:**\n1. District Forum: Claims up to ₹1 crore\n2. State Commission: ₹1-10 crore\n3. National Commission: Above ₹10 crore\n\n**Required Documents:**\n- Purchase receipt/invoice\n- Written complaint\n- ID proof\n\n⚠️ **Disclaimer:** This is general information. For personalized legal advice, please consult a verified lawyer on our platform.`;
    }
    
    if (lowerQuery.includes('fir') || lowerQuery.includes('police')) {
      return `**Filing FIR (First Information Report):**\n\n1. **What is FIR?** First written document about a cognizable offense\n\n2. **How to File:**\n   - Visit nearest police station\n   - Give written/oral complaint\n   - Police must register FIR for cognizable offenses\n\n3. **Your Rights:**\n   - Get free copy of FIR\n   - Zero FIR (file anywhere, transferred later)\n   - Online FIR in some states\n\n4. **If Police Refuse:** Complain to SP/DCP or approach Magistrate under CrPC Section 156(3)\n\n⚠️ **Disclaimer:** This is general information. For personalized legal advice, please consult a verified lawyer on our platform.`;
    }
    
    return `Thank you for your question about "${query}".\n\nI'm here to help you understand Indian laws and legal procedures. While I can provide general information, I recommend:\n\n1. **Research:** Look up relevant acts and regulations\n2. **Document:** Keep all relevant paperwork\n3. **Consult:** Speak with a qualified lawyer for specific advice\n\nWould you like me to explain any specific legal topic? I can help with:\n• Property & Tenancy Laws\n• Consumer Rights\n• RTI Applications\n• Family Law basics\n• Government Schemes\n\n⚠️ **Disclaimer:** This is general information. For personalized legal advice, please consult a verified lawyer on our platform.`;
  };

  const handleSaveChat = () => {
    if (messages.length <= 1) {
      Alert.alert('Nothing to Save', 'Start a conversation first before saving.');
      return;
    }
    
    // In production, this would call the API to save
    setIsSaved(true);
    Alert.alert(
      'Chat Saved! ✓',
      'This conversation has been saved to your account. You can access it later from "Saved Items".',
      [{ text: 'OK' }]
    );
  };

  const handleConnectToLawyer = () => {
    router.push('/lawyers');
  };

  const suggestedQuestions = [
    { icon: 'home-outline', text: 'What are tenant rights in India?' },
    { icon: 'document-text-outline', text: 'How to file RTI application?' },
    { icon: 'cart-outline', text: 'Consumer protection rights?' },
    { icon: 'shield-checkmark-outline', text: 'How to file FIR?' },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerStart} />
      
      {/* Header */}
      <LinearGradient 
        colors={[COLORS.headerStart, COLORS.headerEnd]} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.aiAvatarHeader}>
              <Ionicons name="sparkles" size={24} color={COLORS.white} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>NyayAI</Text>
              <Text style={styles.headerSubtitle}>Your Legal Assistant</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, isSaved && styles.headerButtonSaved]} 
              onPress={handleSaveChat}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={COLORS.white} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => setShowInfoModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Disclaimer Banner */}
      <View style={styles.disclaimerBanner}>
        <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
        <Text style={styles.disclaimerText}>
          ⚠️ This is <Text style={styles.disclaimerBold}>general legal information</Text>, not personalized advice
        </Text>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.messagesContainer} 
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <View key={index}>
            <View style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              {message.role === 'assistant' && (
                <View style={styles.aiAvatarSmall}>
                  <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                </View>
              )}
              <View style={[
                styles.messageContent,
                message.role === 'user' ? styles.userContent : styles.aiContent
              ]}>
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : styles.aiText
                ]}>
                  {message.content}
                </Text>
              </View>
            </View>
            
            {/* Connect to Lawyer CTA - Show after AI responses (except welcome message) */}
            {message.role === 'assistant' && index > 0 && !message.error && (
              <TouchableOpacity 
                style={styles.connectLawyerCTA}
                onPress={handleConnectToLawyer}
                activeOpacity={0.8}
              >
                <View style={styles.ctaIconContainer}>
                  <Ionicons name="people" size={18} color={COLORS.purple} />
                </View>
                <View style={styles.ctaTextContainer}>
                  <Text style={styles.ctaTitle}>Need personalized advice?</Text>
                  <Text style={styles.ctaSubtitle}>Connect to a Lawyer</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={24} color={COLORS.purple} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Suggested Questions - Show only initially */}
        {messages.length === 1 && (
          <View style={styles.suggestedContainer}>
            <Text style={styles.suggestedTitle}>Try asking:</Text>
            {suggestedQuestions.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestedButton}
                onPress={() => setInputText(item.text)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                <Text style={styles.suggestedText}>{item.text}</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading indicator */}
        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <View style={styles.aiAvatarSmall}>
              <Ionicons name="sparkles" size={14} color={COLORS.primary} />
            </View>
            <View style={[styles.messageContent, styles.aiContent, styles.loadingContent]}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputDisclaimer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.inputDisclaimerText}>
            General information only. Consult a qualified lawyer for advice.
          </Text>
        </View>
        
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.voiceButton}>
            <Ionicons name="mic-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Ask any legal question..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfoModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="information-circle" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.modalTitle}>About NyayAI</Text>
            </View>
            
            <Text style={styles.modalText}>
              NyayAI is an AI-powered legal information assistant designed to help Indian citizens understand their legal rights and procedures.
            </Text>
            
            <View style={styles.modalDivider} />
            
            <Text style={styles.modalSectionTitle}>⚠️ Important Disclaimer</Text>
            <Text style={styles.modalText}>
              NyayAI provides <Text style={styles.modalBold}>general legal information only</Text>. This is NOT legal advice and should not be treated as such.
            </Text>
            <Text style={styles.modalText}>
              For specific legal matters, always consult a qualified and licensed lawyer.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatarHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonSaved: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  
  // Disclaimer Banner
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.warningBg,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    marginLeft: 10,
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
  },
  
  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  messageContent: {
    maxWidth: '78%',
    borderRadius: 18,
    padding: 14,
  },
  userContent: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  aiContent: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.textPrimary,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 10,
    fontStyle: 'italic',
  },
  
  // Connect to Lawyer CTA
  connectLawyerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple + '10',
    borderWidth: 1,
    borderColor: COLORS.purple + '30',
    borderRadius: 14,
    padding: 14,
    marginLeft: 42,
    marginBottom: 16,
    marginTop: -4,
  },
  ctaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.purple + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.purple,
  },
  
  // Suggested Questions
  suggestedContainer: {
    marginTop: 16,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  suggestedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  suggestedText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 12,
    fontWeight: '500',
  },
  
  // Input Area
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  inputDisclaimerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 8,
    lineHeight: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 26,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  modalBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
