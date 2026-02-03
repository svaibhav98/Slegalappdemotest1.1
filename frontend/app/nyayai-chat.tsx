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
  StatusBar,
  Image,
  Modal,
  Share,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

// Design System Colors
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
  aiBubble: '#2B2D42',
  userBubble: '#FFFFFF',
  success: '#10B981',
  orange: '#FF9933',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  id: string;
  feedback?: 'up' | 'down' | null;
}

export default function NyayAIChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialMessage = params.initialMessage as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState('NyayAI Chat');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Menu modal state
  const [showMenu, setShowMenu] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // ChatGPT-style drawer state
  const [showDrawer, setShowDrawer] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{id: string, title: string, date: string}>>([]);
  
  // Input buttons state
  const [isRecording, setIsRecording] = useState(false);
  
  // Toast state for copy feedback
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // If there's an initial message, send it automatically
    if (initialMessage) {
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  const getMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('notice') || lowerQuery.includes('draft')) {
      setChatTitle('Legal Notice Drafting');
      return `I can help you draft a legal notice. Here's what I need to know:\n\n**1. Type of Notice:**\n• Rent/Eviction Notice\n• Legal Demand Notice\n• Cease & Desist\n• Employment Notice\n\n**2. Key Details Required:**\n• Parties involved (names, addresses)\n• Facts of the matter\n• Relief/Action requested\n• Timeline for compliance\n\nWould you like me to guide you through drafting a specific type of notice?`;
    }
    
    if (lowerQuery.includes('land') || lowerQuery.includes('dispute') || lowerQuery.includes('property')) {
      setChatTitle('Land Dispute Query');
      return `**Land Dispute Guidance:**\n\nHere are the steps you should consider:\n\n**1. Documentation:**\n• Gather all property documents (sale deed, mutation records)\n• Get latest 7/12 or Khasra/Khatauni extract\n• Collect tax payment receipts\n\n**2. Legal Options:**\n• File complaint with Revenue Officer\n• Approach Civil Court for title suit\n• Seek mediation through Lok Adalat\n\n**3. Timeline:**\n• Revenue proceedings: 3-6 months\n• Civil suit: 2-5 years\n\n**Important:** Land disputes are complex. I recommend consulting a property lawyer for your specific case.`;
    }
    
    if (lowerQuery.includes('tenant') || lowerQuery.includes('rent')) {
      setChatTitle('Tenant Rights Query');
      return `**Your Tenant Rights in India:**\n\n**1. Right to Fair Rent:**\nLandlords cannot charge arbitrary rent. Most states have Rent Control Acts.\n\n**2. Security Deposit:**\nMaximum 2-3 months rent (varies by state)\n\n**3. Notice Period:**\nTypically 1-3 months notice required before eviction\n\n**4. Written Agreement:**\nAlways get a registered rent agreement\n\n**5. Maintenance:**\nLandlord responsible for structural repairs\n\n**6. Essential Services:**\nCannot be denied water, electricity as coercion`;
    }
    
    if (lowerQuery.includes('rti') || lowerQuery.includes('information')) {
      setChatTitle('RTI Application');
      return `**How to File RTI Application:**\n\n**Who Can File:** Any Indian citizen\n\n**Fee:** ₹10 for Central Government (varies for states)\n\n**How to Apply:**\n1. Write application to Public Information Officer (PIO)\n2. State clearly what information you need\n3. Pay the application fee\n\n**Timeline:** Response within 30 days\n\n**Appeals:**\n• First appeal to Appellate Authority (30 days)\n• Second appeal to Information Commission\n\n**Tip:** Be specific in your request for faster response.`;
    }
    
    if (lowerQuery.includes('divorce') || lowerQuery.includes('petition')) {
      setChatTitle('Divorce Petition Chat');
      return `I understand you're looking for help with a divorce petition. To provide relevant guidance, I need some details:\n\n**Please tell me:**\n1. How long have you been married?\n2. Do you have children?\n3. Is this a mutual consent divorce or contested?\n4. What city/state are you in?\n\nThis will help me guide you through the appropriate legal process and documentation needed.`;
    }
    
    return `Thank you for your question. Let me help you understand this better.\n\n**Key Points:**\n1. Every legal matter is unique and context-specific\n2. Documentation is crucial in legal proceedings\n3. Understanding your rights is the first step\n\n**I can help you with:**\n• Property & Tenancy Laws\n• Consumer Rights\n• RTI Applications\n• Family Law basics\n• Government Schemes\n\nCould you provide more details about your specific situation?`;
  };

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      id: `user-${Date.now()}`,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const response = getMockResponse(text);
      const aiMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        id: `assistant-${Date.now()}`,
        feedback: null,
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleConnectLawyer = () => {
    router.push('/lawyers');
  };

  const handleBack = () => {
    router.back();
  };

  const formatTime = () => {
    const now = new Date();
    return `Last Update: ${now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
  };
  
  // Load chat history
  useEffect(() => {
    loadChatHistory();
  }, []);
  
  const loadChatHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('chat_history');
      if (stored) {
        setChatHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading chat history:', error);
    }
  };
  
  const handleNewChat = () => {
    setShowDrawer(false);
    setMessages([]);
    setChatTitle('NyayAI Chat');
    router.back();
  };
  
  const handleSelectChat = (chatId: string) => {
    setShowDrawer(false);
    router.push({
      pathname: '/nyayai-chat',
      params: { chatId }
    });
  };
  
  const handleExportChat = async () => {
    setShowMenu(false);
    const chatText = messages.map(m => 
      `${m.role === 'user' ? 'You' : 'NyayAI'}: ${m.content}`
    ).join('\n\n');
    
    try {
      await Share.share({
        message: `NyayAI Chat Export\n\n${chatText}`,
        title: 'NyayAI Chat',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };
  
  const handleClearChat = () => {
    setShowMenu(false);
    setMessages([]);
    setChatTitle('NyayAI Chat');
  };
  
  const generateSummary = () => {
    if (messages.length === 0) return 'No messages to summarize.';
    
    const userQuestions = messages.filter(m => m.role === 'user').length;
    const aiResponses = messages.filter(m => m.role === 'assistant').length;
    
    return `**Chat Summary**\n\nTotal Messages: ${messages.length}\n• Your Questions: ${userQuestions}\n• AI Responses: ${aiResponses}\n\n**Topic:** ${chatTitle}\n\n**Key Discussion Points:**\nThis conversation covered legal guidance related to ${chatTitle.toLowerCase()}. The AI provided general information and recommended consulting a qualified lawyer for specific advice.`;
  };
  
  // Input button handlers
  const handleAttachment = () => {
    alert('Attachment feature coming soon! You can upload:\n• Documents\n• Images\n• PDFs');
  };
  
  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      alert('Voice recording stopped. Processing...');
    } else {
      setIsRecording(true);
      alert('Voice recording started. Tap again to stop.');
    }
  };

  // Message action handlers
  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await ExpoClipboard.setStringAsync(content);
      showToastMessage('Copied to clipboard');
    } catch (error) {
      // Fallback for web
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(content);
        showToastMessage('Copied to clipboard');
      }
    }
  };

  const handleFeedback = async (messageId: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        // Toggle feedback if same type clicked again
        const newFeedback = msg.feedback === type ? null : type;
        return { ...msg, feedback: newFeedback };
      }
      return msg;
    }));
    
    // Store feedback locally
    try {
      const feedbackKey = `feedback_${messageId}`;
      const feedbackData = { messageId, type, timestamp: new Date().toISOString() };
      await AsyncStorage.setItem(feedbackKey, JSON.stringify(feedbackData));
    } catch (error) {
      console.log('Error storing feedback:', error);
    }
    
    showToastMessage(type === 'up' ? 'Thanks for the feedback!' : 'We\'ll improve');
  };

  const handleShareMessage = async (content: string) => {
    try {
      await Share.share({
        message: content,
        title: 'NyayAI Response',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.gradientStart} />
      
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.container}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setShowDrawer(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="menu" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>
              <Text style={styles.headerSubtitle}>{formatTime()}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => setShowMenu(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              <View key={message.id || index}>
                {/* Message Bubble */}
                <View style={[
                  styles.messageRow,
                  message.role === 'user' ? styles.userRow : styles.aiRow
                ]}>
                  {message.role === 'assistant' && (
                    <View style={styles.aiAvatar}>
                      <Ionicons name="chatbubbles" size={16} color={COLORS.white} />
                    </View>
                  )}
                  
                  <View style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userBubble : styles.aiBubble
                  ]}>
                    <Text style={[
                      styles.messageText,
                      message.role === 'user' ? styles.userText : styles.aiText
                    ]}>
                      {message.content}
                    </Text>
                  </View>
                  
                  {message.role === 'user' && (
                    <View style={styles.userAvatar}>
                      <Ionicons name="person" size={16} color={COLORS.white} />
                    </View>
                  )}
                </View>

                {/* Action Bar for Assistant Messages - ChatGPT style */}
                {message.role === 'assistant' && (
                  <View style={styles.messageActionsContainer}>
                    <View style={styles.messageActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleCopyMessage(message.content)}
                        data-testid={`copy-btn-${message.id}`}
                      >
                        <Ionicons name="copy-outline" size={16} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleFeedback(message.id, 'up')}
                        data-testid={`thumbsup-btn-${message.id}`}
                      >
                        <Ionicons 
                          name={message.feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} 
                          size={16} 
                          color={message.feedback === 'up' ? COLORS.success : COLORS.textSecondary} 
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleFeedback(message.id, 'down')}
                        data-testid={`thumbsdown-btn-${message.id}`}
                      >
                        <Ionicons 
                          name={message.feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} 
                          size={16} 
                          color={message.feedback === 'down' ? COLORS.orange : COLORS.textSecondary} 
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleShareMessage(message.content)}
                        data-testid={`share-btn-${message.id}`}
                      >
                        <Ionicons name="share-outline" size={16} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Connect to Lawyer CTA - After AI messages */}
                {message.role === 'assistant' && (
                  <View style={styles.ctaContainer}>
                    <Text style={styles.ctaLabel}>NyayAI responded</Text>
                    <TouchableOpacity 
                      onPress={() => router.push('/lawyers')} 
                      activeOpacity={0.8}
                    >
                      <Text style={styles.ctaLink}>Consult Lawyer</Text>
                    </TouchableOpacity>
                    <Text style={styles.ctaSeparator}> or </Text>
                    <TouchableOpacity 
                      onPress={() => router.push('/(tabs)/documents')} 
                      activeOpacity={0.8}
                    >
                      <Text style={styles.ctaLink}>Draft Document</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* Loading indicator */}
            {loading && (
              <View style={[styles.messageRow, styles.aiRow]}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="chatbubbles" size={16} color={COLORS.white} />
                </View>
                <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.loadingText}>NyayAI is typing...</Text>
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcons}>
                <TouchableOpacity style={styles.inputIcon}>
                  <Ionicons name="sparkles" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIcon} onPress={handleAttachment}>
                  <Ionicons name="attach" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIcon} onPress={handleVoiceRecord}>
                  <Ionicons name={isRecording ? "mic" : "mic-outline"} size={20} color={isRecording ? COLORS.orange : COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Type your question to NyayAI."
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
            <Text style={styles.menuTitle}>Chat Options</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowSummaryModal(true);
              }}
              disabled={messages.length === 0}
            >
              <Ionicons name="document-text-outline" size={22} color={messages.length === 0 ? COLORS.textMuted : COLORS.textPrimary} />
              <Text style={[styles.menuItemText, messages.length === 0 && styles.menuItemDisabled]}>
                View Chat Summary
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleExportChat}
              disabled={messages.length === 0}
            >
              <Ionicons name="share-outline" size={22} color={messages.length === 0 ? COLORS.textMuted : COLORS.textPrimary} />
              <Text style={[styles.menuItemText, messages.length === 0 && styles.menuItemDisabled]}>
                Export Chat
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleConnectLawyer}
            >
              <Ionicons name="people-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>Connect with Lawyer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleClearChat}
              disabled={messages.length === 0}
            >
              <Ionicons name="trash-outline" size={22} color={messages.length === 0 ? COLORS.textMuted : COLORS.orange} />
              <Text style={[styles.menuItemText, messages.length === 0 ? styles.menuItemDisabled : styles.menuItemDanger]}>
                Clear Chat
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Summary Modal */}
      <Modal
        visible={showSummaryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSummaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chat Summary</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{generateSummary()}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSummaryModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* ChatGPT-Style Left Drawer */}
      <Modal
        visible={showDrawer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDrawer(false)}
      >
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>NyayAI Chats</Text>
              <TouchableOpacity onPress={() => setShowDrawer(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.newChatButton}
              onPress={handleNewChat}
            >
              <Ionicons name="add-circle-outline" size={22} color={COLORS.orange} />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
            
            <ScrollView style={styles.drawerContent}>
              <Text style={styles.drawerSectionTitle}>Recent Chats</Text>
              {chatHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyStateText}>No chat history yet</Text>
                  <Text style={styles.emptyStateSubtext}>Start a conversation to see it here</Text>
                </View>
              ) : (
                chatHistory.map((chat) => (
                  <TouchableOpacity 
                    key={chat.id}
                    style={styles.chatHistoryItem}
                    onPress={() => handleSelectChat(chat.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                    <View style={styles.chatHistoryContent}>
                      <Text style={styles.chatHistoryTitle} numberOfLines={1}>{chat.title}</Text>
                      <Text style={styles.chatHistoryDate}>{chat.date}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))
              )}
              
              <Text style={styles.drawerSectionTitle}>Saved</Text>
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyStateSubtext}>No saved chats</Text>
              </View>
            </ScrollView>
          </View>
          
          <TouchableOpacity 
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setShowDrawer(false)}
          />
        </View>
      </Modal>
      
      {/* Toast Notification */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
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
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.aiBubble,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textPrimary,
  },
  aiText: {
    color: COLORS.white,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 10,
    fontStyle: 'italic',
  },

  // CTA
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
    marginBottom: 16,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  ctaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  ctaLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  ctaSeparator: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Message Actions (ChatGPT-style)
  messageActionsContainer: {
    marginLeft: 40,
    marginTop: 4,
    marginBottom: 8,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.aiBubble,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },

  // Input
  inputSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
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
  menuItemDisabled: {
    color: COLORS.textMuted,
  },
  menuItemDanger: {
    color: COLORS.orange,
  },
  
  // Summary Modal
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  
  // ChatGPT-Style Drawer - Opens from LEFT
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerContainer: {
    width: 280, // Compact width
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  newChatText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  drawerContent: {
    flex: 1,
    padding: 16,
  },
  drawerSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 12,
    marginTop: 8,
  },
  chatHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
  },
  chatHistoryContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  chatHistoryDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
