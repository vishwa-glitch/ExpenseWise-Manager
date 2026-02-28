import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { startAIGoalSession, chatWithAI, finalizeAIGoal, clearAISession } from '../../store/slices/goalsSlice';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';

interface AIGoalSettingScreenProps {
  navigation: any;
}

const AIGoalSettingScreen: React.FC<AIGoalSettingScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { aiSession, isLoading } = useTypedSelector((state) => state.goals);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isSessionStarted) {
      startSession();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Handle AI session response
    if (aiSession) {
      console.log('🤖 AI Session data received:', aiSession);
      
      // Check if this is a new session start
      if (aiSession.session_id && !isSessionStarted) {
        setIsSessionStarted(true);
        
        // Add initial AI message if available
        let initialMessage = "Hello! I'm here to help you set up your financial goals. Let's start by understanding your current financial situation and what you'd like to achieve.";
        
        // Safely extract the message - check if it's a string or object
        if (aiSession.response) {
          if (typeof aiSession.response === 'string') {
            initialMessage = aiSession.response;
          } else if (typeof aiSession.response === 'object' && aiSession.response.message) {
            initialMessage = aiSession.response.message;
          }
        } else if (aiSession.message) {
          if (typeof aiSession.message === 'string') {
            initialMessage = aiSession.message;
          } else if (typeof aiSession.message === 'object' && aiSession.message.message) {
            initialMessage = aiSession.message.message;
          }
        }
        
        setChatHistory([{
          role: 'assistant',
          content: initialMessage
        }]);
      }
      
      // Handle chat response for ongoing conversation
      if (isSessionStarted && chatHistory.length > 0) {
        let responseMessage = '';
        
        // Safely extract the response message
        if (aiSession.response) {
          if (typeof aiSession.response === 'string') {
            responseMessage = aiSession.response;
          } else if (typeof aiSession.response === 'object') {
            // Handle object response - extract message field
            responseMessage = aiSession.response.message || 
                            aiSession.response.content || 
                            JSON.stringify(aiSession.response);
          }
        } else if (aiSession.message) {
          if (typeof aiSession.message === 'string') {
            responseMessage = aiSession.message;
          } else if (typeof aiSession.message === 'object') {
            // Handle object message - extract message field
            responseMessage = aiSession.message.message || 
                            aiSession.message.content || 
                            JSON.stringify(aiSession.message);
          }
        }
        
        // Only add to chat history if we have a valid response and it's not already added
        if (responseMessage && responseMessage.trim()) {
          setChatHistory(prev => {
            // Check if the last message is from assistant to avoid duplicates
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === responseMessage) {
              return prev; // Don't add duplicate
            }
            
            return [...prev, {
              role: 'assistant',
              content: responseMessage
            }];
          });
        }
      }
    }
  }, [aiSession, isSessionStarted]);

  const startSession = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping AI session start - user not authenticated');
      return;
    }

    try {
      console.log('🤖 Starting AI goal session...');
      await dispatch(startAIGoalSession()).unwrap();
    } catch (error: any) {
      console.error('❌ Failed to start AI session:', error);
      Alert.alert('Error', 'Failed to start AI session. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !aiSession?.session_id || isSending) return;

    const userMessage = message.trim();
    setMessage('');
    setIsSending(true);

    // Add user message to chat history immediately
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);

    try {
      console.log('💬 Sending message to AI:', userMessage);
      await dispatch(chatWithAI({
        sessionId: aiSession.session_id,
        message: userMessage
      })).unwrap();
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove the user message from chat history on error
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleFinalize = async () => {
    if (!aiSession?.session_id) return;

    Alert.alert(
      'Finalize Goal',
      'Are you ready to create this goal based on our conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Goal',
          onPress: async () => {
            try {
              await dispatch(finalizeAIGoal(aiSession.session_id)).unwrap();
              Alert.alert(
                'Success',
                'Your goal has been created successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      dispatch(clearAISession());
                      navigation.goBack();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', 'Failed to create goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderChatMessage = (item: { role: 'user' | 'assistant'; content: string }, index: number) => {
    // Ensure content is always a string
    const messageContent = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
    
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          item.role === 'user' ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.messageRole}>
            {item.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
          </Text>
        </View>
        <Text style={styles.messageContent}>{messageContent}</Text>
      </View>
    );
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (isLoading && !isSessionStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Starting AI Goal Session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            dispatch(clearAISession());
            navigation.goBack();
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Goal Setting</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Messages */}
        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.length === 0 && isSessionStarted && (
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeIcon}>🤖</Text>
              <Text style={styles.welcomeTitle}>AI Goal Assistant</Text>
              <Text style={styles.welcomeText}>
                I'm here to help you create personalized financial goals based on your situation and aspirations.
                Let's start by telling me about your financial objectives!
              </Text>
            </View>
          )}
          
          {chatHistory.map(renderChatMessage)}
          
          {isSending && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>AI is thinking...</Text>
              <LoadingSpinner size="small" />
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!message.trim() || isSending}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <CustomButton
              title="Finalize Goal"
              onPress={handleFinalize}
              variant="primary"
              size="small"
              style={styles.actionButton}
              disabled={chatHistory.length < 2} // Need at least one exchange
            />
            <CustomButton
              title="Start Over"
              onPress={() => {
                setChatHistory([]);
                setMessage('');
                startSession();
              }}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  welcomeMessage: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  welcomeText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageContainer: {
    marginBottom: spacing.lg,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: spacing.md,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: spacing.md,
  },
  messageHeader: {
    marginBottom: spacing.sm,
  },
  messageRole: {
    ...typography.small,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  messageContent: {
    ...typography.body,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  typingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: colors.background,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default AIGoalSettingScreen;