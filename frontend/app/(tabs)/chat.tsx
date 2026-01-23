import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { chatAPI } from '../../utils/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setSessionId(`session_${Date.now()}`);
    setMessages([{
      role: 'assistant',
      content: 'Hello! I am NyayAI, your legal information assistant. Ask me anything about Indian laws, your rights, or legal procedures. Remember, this is general information only - for specific advice, please consult a verified lawyer.',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', content: inputText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(inputText, sessionId);
      const aiMessage = { role: 'assistant', content: response.response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString(), error: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const suggestedQuestions = [
    'What are my rights as a tenant?',
    'How do I file an RTI application?',
    'What is the Consumer Protection Act?',
    'How to register a police complaint?'
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>NyayAI</Text>
            <Text style={styles.headerSubtitle}>Your Legal Assistant</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="alert-circle" size={16} color={Colors.warning} />
        <Text style={styles.disclaimerText}>This is general legal information, not legal advice</Text>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map((message, index) => (
          <View key={index} style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {message.role === 'assistant' && (
              <View style={styles.aiAvatar}>
                <Ionicons name="chatbubble-ellipses" size={16} color={Colors.primary} />
              </View>
            )}
            <View style={[styles.messageContent, message.role === 'user' ? styles.userContent : styles.aiContent]}>
              <Text style={[styles.messageText, message.role === 'user' ? styles.userText : styles.aiText]}>{message.content}</Text>
              {message.role === 'assistant' && !message.error && (
                <TouchableOpacity style={styles.lawyerCTA}>
                  <Text style={styles.lawyerCTAText}>Connect to a Lawyer</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {messages.length === 1 && (
          <View style={styles.suggestedQuestionsContainer}>
            <Text style={styles.suggestedTitle}>Try asking:</Text>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity key={index} style={styles.suggestedButton} onPress={() => { setInputText(question); handleSend(); }}>
                <Text style={styles.suggestedText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="chatbubble-ellipses" size={16} color={Colors.primary} />
            </View>
            <View style={[styles.messageContent, styles.aiContent]}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.bottomDisclaimer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.bottomDisclaimerText}>NyayAI provides general legal information. For specific legal advice, please consult a qualified lawyer.</Text>
        </View>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.voiceButton}>
            <Ionicons name="mic-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput style={styles.input} placeholder="Ask NyayAI anything..." value={inputText} onChangeText={setInputText} multiline maxLength={500} editable={!loading} />
          <TouchableOpacity style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]} onPress={handleSend} disabled={!inputText.trim() || loading}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  aiIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  headerSubtitle: { fontSize: 12, color: Colors.textSecondary },
  infoButton: { padding: 8 },
  disclaimer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.warning + '15' },
  disclaimerText: { fontSize: 12, color: Colors.text, marginLeft: 8, flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20 },
  messageBubble: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageContent: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  userContent: { backgroundColor: Colors.primary },
  aiContent: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  aiText: { color: Colors.text },
  lawyerCTA: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  lawyerCTAText: { fontSize: 12, fontWeight: '600', color: Colors.primary, marginRight: 4 },
  suggestedQuestionsContainer: { marginTop: 24 },
  suggestedTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  suggestedButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, marginBottom: 8 },
  suggestedText: { fontSize: 14, color: Colors.text },
  inputContainer: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  bottomDisclaimer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.warning + '15', padding: 10, borderRadius: 8, marginBottom: 12 },
  bottomDisclaimerText: { fontSize: 11, color: Colors.text, marginLeft: 6, flex: 1, lineHeight: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 24, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  voiceButton: { padding: 8 },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, color: Colors.text, maxHeight: 100 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
});
