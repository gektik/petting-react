import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Send, Camera, Smile } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Chat, Message, User } from '@/types';
import { apiService } from '@/services/api';
import { mockChats, mockMessages } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      loadChat();
    }
  }, [id]);

  const loadChat = async () => {
    try {
      setLoading(true);
      // Mock data kullan
      const foundChat = mockChats.find(c => c.id === id);
      if (foundChat) {
        setChat(foundChat);
        setMessages(foundChat.messages);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      Alert.alert('Hata', 'Sohbet yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Optimistic update
      const tempMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || '1',
        receiverId: chat?.participants.find(p => p.id !== user?.id)?.id || '2',
        content: messageText,
        type: 'text',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, tempMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Message sent:', messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilirken hata oluştu.');
      // Remove failed message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.id;
    const otherUser = chat?.participants.find(p => p.id !== user?.id);

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
        {!isMyMessage && (
          <Image
            source={{ uri: otherUser?.profilePhoto }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading || !chat) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Sohbet yükleniyor...</Text>
      </LinearGradient>
    );
  }

  const otherUser = chat.participants.find(p => p.id !== user?.id);

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: otherUser?.profilePhoto }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerText}>
            <Text style={[styles.headerName, { color: theme.colors.text }]}>{otherUser?.username}</Text>
            <Text style={[styles.headerStatus, { color: theme.colors.success }]}>Çevrimiçi</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.headerAction}>
          <Camera size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.inputAction}>
            <Smile size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, { color: theme.colors.text }]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Mesaj yazın..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputAction: {
    marginRight: 12,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});